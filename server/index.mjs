import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { db, BACKUP_DIR, DB_BACKUP_DIR, DB_PATH, logAudit, runTransaction, verifyProductionSafety } from './db.mjs';
import { exportCrmExcelReport } from './excelExporter.mjs';
import { 
  enqueueSyncTask, 
  runOutboxWorkerBatch, 
  getOutboxQueueStats, 
  retryAllFailedTasks 
} from './syncWorker.mjs';
import { startMonthlyCronScheduler, executeMonthlyExport } from './cronService.mjs';
import { createDatabaseBackup, listDatabaseBackups } from './backup.mjs';

const PORT = process.env.PORT || 4321;
const VERSION = '1.1.6';

// Helper đọc body request JSON
const readJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
};

// Helper gửi JSON response kèm CORS
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-User-Name'
  });
  res.end(JSON.stringify(data));
};

// ==========================================
// DATA MAPPERS (SQLite Row <-> CRM Entity)
// ==========================================

const mapDbRowToCustomer = (row) => {
  if (!row) return null;
  let shootingLocations = [];
  try {
    if (row.shooting_locations) {
      shootingLocations = typeof row.shooting_locations === 'string' && row.shooting_locations.startsWith('[')
        ? JSON.parse(row.shooting_locations)
        : row.shooting_locations.split(',').map(s => s.trim()).filter(Boolean);
    }
  } catch {}

  let utm = undefined;
  try {
    if (row.utm_json) utm = JSON.parse(row.utm_json);
  } catch {}

  return {
    id: row.id,
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || '',
    facebook: row.facebook || '',
    tiktok: row.tiktok || '',
    zalo: row.zalo || '',
    schoolId: row.school_id || '',
    schoolName: row.school_name || '',
    grade: row.grade || 'Khối 12',
    className: row.class_name || '',
    academicYear: row.academic_year || '2025-2026',
    region: row.region || '',
    city: row.city || '',
    district: row.district || '',
    representativeRole: row.representative_role || 'Lớp trưởng',
    studentCount: Number(row.student_count) || 0,
    serviceType: row.service_type || 'Kỷ yếu Concept',
    servicePackageId: row.service_package_id || '',
    servicePackageName: row.service_package_name || '',
    concept: row.concept || '',
    expectedShootDate: row.expected_shoot_date || '',
    shootingLocations,
    expectedBudget: Number(row.expected_budget) || 0,
    specialRequests: row.special_requests || '',
    notes: row.notes || '',
    rawDriveUrl: row.raw_drive_url || '',
    driveUrl: row.drive_url || '',
    photoNotes: row.photo_notes || '',
    shotDate: row.shot_date || '',
    photoCount: Number(row.photo_count) || 0,
    source: row.lead_source || 'Facebook Ads',
    campaignName: row.campaign_name || '',
    utm,
    pipelineStage: row.pipeline_stage || 'New Lead',
    assignedSalesId: row.assigned_sales_id || '',
    assignedSalesName: row.assigned_sales_name || 'Chưa gán',
    assignedCareStaffId: row.assigned_care_staff_id || '',
    assignedCareStaffName: row.assigned_care_staff_name || '',
    createdById: row.created_by_id || '',
    createdByName: row.created_by_name || '',
    totalRevenue: Number(row.total_revenue) || Number(row.contract_value) || 0,
    paidAmount: Number(row.paid_amount) || Number(row.deposit_amount) || 0,
    contractValue: Number(row.contract_value) || 0,
    depositAmount: Number(row.deposit_amount) || 0,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    lastContactedAt: row.last_contacted_at || undefined,
    version: row.version || 1
  };
};

const mapDbRowToBooking = (row) => {
  if (!row) return null;
  let assignments = {};
  try {
    if (row.assignments_json) assignments = JSON.parse(row.assignments_json);
  } catch {}

  return {
    id: row.id,
    code: row.code || `BK-${row.id.slice(-6)}`,
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    schoolName: row.school_name || '',
    className: row.class_name || '',
    shootDate: row.shoot_date || '',
    startTime: row.start_time || '07:30',
    endTime: row.end_time || '17:00',
    location: row.location || '',
    city: row.city || '',
    district: row.district || '',
    studentCount: Number(row.student_count) || 0,
    packageId: row.package_id || '',
    packageName: row.package_name || '',
    concept: row.concept || '',
    assignments: {
      leadPhotographerId: row.photographer_id || assignments.leadPhotographerId || '',
      leadPhotographerName: row.photographer_name || assignments.leadPhotographerName || '',
      assistantPhotographerIds: assignments.assistantPhotographerIds || (row.support_photographer_id ? [row.support_photographer_id] : []),
      assistantNames: assignments.assistantNames || [],
      ...assignments
    },
    totalAmount: Number(row.total_amount) || 0,
    depositAmount: Number(row.deposit_amount) || 0,
    remainingAmount: Number(row.remaining_amount) || Math.max(0, (Number(row.total_amount) || 0) - (Number(row.deposit_amount) || 0)),
    paymentStatus: row.payment_status || (row.deposit_paid ? 'Đã cọc' : 'Chưa cọc'),
    bookingStatus: row.booking_status || row.status || 'Chờ xác nhận',
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    version: row.version || 1
  };
};

// ==========================================
// HTTP SERVER & ROUTING
// ==========================================

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-User-Name'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const currentUserId = req.headers['x-user-id'] || 'system';
  const currentUserName = req.headers['x-user-name'] || 'Người dùng CRM';

  try {
    // -------------------------------------------------------------
    // 1. HEALTH CHECKS
    // -------------------------------------------------------------
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        database: 'connected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: VERSION
      });
    }

    if (pathname === '/api/health/database' && req.method === 'GET') {
      let dbSizeBytes = 0;
      try {
        dbSizeBytes = fs.statSync(DB_PATH).size;
      } catch {}

      const custCount = db.prepare('SELECT COUNT(*) as c FROM customers WHERE is_deleted = 0').get().c;
      const custDeleted = db.prepare('SELECT COUNT(*) as c FROM customers WHERE is_deleted = 1').get().c;
      const bookCount = db.prepare('SELECT COUNT(*) as c FROM bookings WHERE is_deleted = 0').get().c;
      const photoCount = db.prepare('SELECT COUNT(*) as c FROM photographers').get().c;
      const staffCount = db.prepare('SELECT COUNT(*) as c FROM sales_staff').get().c;
      const auditCount = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get().c;
      const latestMig = db.prepare('SELECT MAX(version) as v FROM schema_migrations').get().v || 1;
      const backups = listDatabaseBackups();

      return sendJson(res, 200, {
        status: 'healthy',
        database: {
          engine: 'SQLite Persistent (node:sqlite WAL mode)',
          path: DB_PATH,
          sizeBytes: dbSizeBytes,
          latestMigrationVersion: latestMig,
          productionSafetyLock: process.env.NODE_ENV === 'production' && process.env.ALLOW_DESTRUCTIVE_DATABASE_OPERATION !== 'true' ? 'LOCKED_SAFE' : 'OPEN'
        },
        records: {
          customersActive: custCount,
          customersDeleted: custDeleted,
          bookingsActive: bookCount,
          photographers: photoCount,
          salesStaff: staffCount,
          auditLogs: auditCount
        },
        backups: {
          totalFiles: backups.length,
          latestBackup: backups[0] || null
        },
        timestamp: new Date().toISOString()
      });
    }

    // -------------------------------------------------------------
    // 2. CUSTOMERS REST API
    // -------------------------------------------------------------

    // GET /api/customers - Lấy danh sách khách hàng (có phân trang & tìm kiếm)
    if (pathname === '/api/customers' && req.method === 'GET') {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10)));
      const offset = (page - 1) * limit;
      const search = (url.searchParams.get('search') || '').trim();
      const stage = url.searchParams.get('stage') || '';
      const salesId = url.searchParams.get('sales_id') || '';
      const includeDeleted = url.searchParams.get('include_deleted') === 'true';

      let whereClauses = [includeDeleted ? '1=1' : 'is_deleted = 0'];
      let params = [];

      if (search) {
        whereClauses.push('(name LIKE ? OR phone LIKE ? OR school_name LIKE ? OR class_name LIKE ?)');
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }
      if (stage) {
        whereClauses.push('pipeline_stage = ?');
        params.push(stage);
      }
      if (salesId) {
        whereClauses.push('assigned_sales_id = ?');
        params.push(salesId);
      }

      const whereSql = whereClauses.join(' AND ');
      const totalCount = db.prepare(`SELECT COUNT(*) as c FROM customers WHERE ${whereSql}`).get(...params).c;

      const querySql = `
        SELECT * FROM customers 
        WHERE ${whereSql} 
        ORDER BY updated_at DESC 
        LIMIT ? OFFSET ?
      `;
      const rows = db.prepare(querySql).all(...params, limit, offset);
      const data = rows.map(mapDbRowToCustomer);

      return sendJson(res, 200, {
        success: true,
        data,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1
        }
      });
    }

    // GET /api/customers/:id - Chi tiết 1 khách hàng
    if (pathname.startsWith('/api/customers/') && req.method === 'GET') {
      const id = pathname.replace('/api/customers/', '').trim();
      const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!row) {
        return sendJson(res, 404, { success: false, message: 'Không tìm thấy khách hàng' });
      }
      return sendJson(res, 200, { success: true, data: mapDbRowToCustomer(row) });
    }

    // POST /api/customers - Tạo mới khách hàng
    if (pathname === '/api/customers' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.name) {
        return sendJson(res, 400, { success: false, message: 'Tên khách hàng là bắt buộc' });
      }

      const id = body.id || `cust-${Date.now()}`;
      const shootingLocationsStr = Array.isArray(body.shootingLocations)
        ? JSON.stringify(body.shootingLocations)
        : (body.shootingLocations || '');
      const utmStr = body.utm ? JSON.stringify(body.utm) : null;

      runTransaction(() => {
        const stmt = db.prepare(`
          INSERT INTO customers (
            id, name, phone, email, facebook, tiktok, zalo,
            school_id, school_name, grade, class_name, academic_year,
            region, city, district, representative_role, student_count,
            service_type, service_package_id, service_package_name, concept,
            expected_shoot_date, shooting_locations, expected_budget, special_requests, notes,
            raw_drive_url, drive_url, photo_notes, shot_date, photo_count,
            lead_source, campaign_name, utm_json,
            pipeline_stage, assigned_sales_id, assigned_sales_name,
            assigned_care_staff_id, assigned_care_staff_name,
            created_by_id, created_by_name,
            contract_value, deposit_amount, total_revenue, paid_amount,
            version, is_deleted, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?,
            ?, ?, ?, ?,
            1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `);

        stmt.run(
          id, body.name, body.phone || '', body.email || '', body.facebook || '', body.tiktok || '', body.zalo || '',
          body.schoolId || '', body.schoolName || '', body.grade || 'Khối 12', body.className || '', body.academicYear || '2025-2026',
          body.region || '', body.city || '', body.district || '', body.representativeRole || 'Lớp trưởng', Number(body.studentCount) || 0,
          body.serviceType || 'Kỷ yếu Concept', body.servicePackageId || '', body.servicePackageName || '', body.concept || '',
          body.expectedShootDate || '', shootingLocationsStr, Number(body.expectedBudget) || 0, body.specialRequests || '', body.notes || '',
          body.rawDriveUrl || '', body.driveUrl || '', body.photoNotes || '', body.shotDate || '', Number(body.photoCount) || 0,
          body.source || 'Facebook Ads', body.campaignName || '', utmStr,
          body.pipelineStage || 'New Lead', body.assignedSalesId || '', body.assignedSalesName || 'Chưa gán',
          body.assignedCareStaffId || '', body.assignedCareStaffName || '',
          currentUserId, currentUserName,
          Number(body.contractValue || body.totalRevenue) || 0, Number(body.depositAmount || body.paidAmount) || 0,
          Number(body.totalRevenue) || 0, Number(body.paidAmount) || 0
        );

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'CREATE',
          tableName: 'customers',
          recordId: id,
          newData: body,
          ipAddress
        });
      });

      const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      return sendJson(res, 201, { success: true, data: mapDbRowToCustomer(created) });
    }

    // PUT /api/customers/:id - Sửa thông tin khách hàng (Cung cấp chức năng sửa thông tin an toàn)
    if (pathname.startsWith('/api/customers/') && req.method === 'PUT') {
      const id = pathname.replace('/api/customers/', '').trim();
      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Khách hàng không tồn tại trên hệ thống' });
      }

      const body = await readJsonBody(req);
      const oldMapped = mapDbRowToCustomer(existing);

      const shootingLocationsStr = Array.isArray(body.shootingLocations)
        ? JSON.stringify(body.shootingLocations)
        : (body.shootingLocations ?? existing.shooting_locations);
      const utmStr = body.utm ? JSON.stringify(body.utm) : (existing.utm_json || null);

      runTransaction(() => {
        const stmt = db.prepare(`
          UPDATE customers SET
            name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            facebook = COALESCE(?, facebook),
            tiktok = COALESCE(?, tiktok),
            zalo = COALESCE(?, zalo),
            school_id = COALESCE(?, school_id),
            school_name = COALESCE(?, school_name),
            grade = COALESCE(?, grade),
            class_name = COALESCE(?, class_name),
            academic_year = COALESCE(?, academic_year),
            region = COALESCE(?, region),
            city = COALESCE(?, city),
            district = COALESCE(?, district),
            representative_role = COALESCE(?, representative_role),
            student_count = COALESCE(?, student_count),
            service_type = COALESCE(?, service_type),
            service_package_id = COALESCE(?, service_package_id),
            service_package_name = COALESCE(?, service_package_name),
            concept = COALESCE(?, concept),
            expected_shoot_date = COALESCE(?, expected_shoot_date),
            shooting_locations = COALESCE(?, shooting_locations),
            expected_budget = COALESCE(?, expected_budget),
            special_requests = COALESCE(?, special_requests),
            notes = COALESCE(?, notes),
            raw_drive_url = COALESCE(?, raw_drive_url),
            drive_url = COALESCE(?, drive_url),
            photo_notes = COALESCE(?, photo_notes),
            shot_date = COALESCE(?, shot_date),
            photo_count = COALESCE(?, photo_count),
            lead_source = COALESCE(?, lead_source),
            campaign_name = COALESCE(?, campaign_name),
            utm_json = COALESCE(?, utm_json),
            pipeline_stage = COALESCE(?, pipeline_stage),
            assigned_sales_id = COALESCE(?, assigned_sales_id),
            assigned_sales_name = COALESCE(?, assigned_sales_name),
            assigned_care_staff_id = COALESCE(?, assigned_care_staff_id),
            assigned_care_staff_name = COALESCE(?, assigned_care_staff_name),
            contract_value = COALESCE(?, contract_value),
            deposit_amount = COALESCE(?, deposit_amount),
            total_revenue = COALESCE(?, total_revenue),
            paid_amount = COALESCE(?, paid_amount),
            last_contacted_at = COALESCE(?, last_contacted_at),
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);

// Helper chuyển undefined sang null để SQLite không bị lỗi parameter binding
const toSql = (val) => (val === undefined ? null : val);

        stmt.run(
          toSql(body.name), toSql(body.phone), toSql(body.email), toSql(body.facebook), toSql(body.tiktok), toSql(body.zalo),
          toSql(body.schoolId), toSql(body.schoolName), toSql(body.grade), toSql(body.className), toSql(body.academicYear),
          toSql(body.region), toSql(body.city), toSql(body.district), toSql(body.representativeRole), body.studentCount !== undefined ? Number(body.studentCount) : null,
          toSql(body.serviceType), toSql(body.servicePackageId), toSql(body.servicePackageName), toSql(body.concept),
          toSql(body.expectedShootDate), toSql(shootingLocationsStr), body.expectedBudget !== undefined ? Number(body.expectedBudget) : null, toSql(body.specialRequests), toSql(body.notes),
          toSql(body.rawDriveUrl), toSql(body.driveUrl), toSql(body.photoNotes), toSql(body.shotDate), body.photoCount !== undefined ? Number(body.photoCount) : null,
          toSql(body.source), toSql(body.campaignName), toSql(utmStr),
          toSql(body.pipelineStage), toSql(body.assignedSalesId), toSql(body.assignedSalesName),
          toSql(body.assignedCareStaffId), toSql(body.assignedCareStaffName),
          body.contractValue !== undefined ? Number(body.contractValue) : null, body.depositAmount !== undefined ? Number(body.depositAmount) : null,
          body.totalRevenue !== undefined ? Number(body.totalRevenue) : null, body.paidAmount !== undefined ? Number(body.paidAmount) : null,
          toSql(body.lastContactedAt),
          id
        );

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'UPDATE',
          tableName: 'customers',
          recordId: id,
          oldData: oldMapped,
          newData: body,
          ipAddress
        });
      });

      const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      return sendJson(res, 200, { success: true, data: mapDbRowToCustomer(updated) });
    }

    // DELETE /api/customers/:id - Soft Delete an toàn
    if (pathname.startsWith('/api/customers/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/customers/', '').trim();
      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Khách hàng không tồn tại' });
      }

      runTransaction(() => {
        db.prepare(`
          UPDATE customers SET 
            is_deleted = 1, 
            deleted_at = CURRENT_TIMESTAMP, 
            deleted_by = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(currentUserName, id);

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'DELETE',
          tableName: 'customers',
          recordId: id,
          oldData: mapDbRowToCustomer(existing),
          ipAddress
        });
      });

      return sendJson(res, 200, { success: true, message: 'Đã chuyển khách hàng vào thùng rác (Soft Delete)' });
    }

    // POST /api/customers/:id/restore - Khôi phục từ thùng rác
    if (pathname.match(/^\/api\/customers\/[^/]+\/restore$/) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      runTransaction(() => {
        db.prepare(`
          UPDATE customers SET 
            is_deleted = 0, 
            deleted_at = NULL, 
            deleted_by = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(id);

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'RESTORE',
          tableName: 'customers',
          recordId: id,
          ipAddress
        });
      });
      return sendJson(res, 200, { success: true, message: 'Đã khôi phục khách hàng thành công' });
    }

    // -------------------------------------------------------------
    // 3. BOOKINGS REST API
    // -------------------------------------------------------------

    // GET /api/bookings
    if (pathname === '/api/bookings' && req.method === 'GET') {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10)));
      const offset = (page - 1) * limit;
      const search = (url.searchParams.get('search') || '').trim();

      let whereClauses = ['is_deleted = 0'];
      let params = [];

      if (search) {
        whereClauses.push('(title LIKE ? OR customer_name LIKE ? OR school_name LIKE ? OR class_name LIKE ? OR code LIKE ?)');
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const whereSql = whereClauses.join(' AND ');
      const totalCount = db.prepare(`SELECT COUNT(*) as c FROM bookings WHERE ${whereSql}`).get(...params).c;

      const rows = db.prepare(`
        SELECT * FROM bookings 
        WHERE ${whereSql} 
        ORDER BY shoot_date DESC, updated_at DESC 
        LIMIT ? OFFSET ?
      `).all(...params, limit, offset);

      return sendJson(res, 200, {
        success: true,
        data: rows.map(mapDbRowToBooking),
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1
        }
      });
    }

    // POST /api/bookings
    if (pathname === '/api/bookings' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const id = body.id || `bk-${Date.now()}`;
      const assignmentsStr = body.assignments ? JSON.stringify(body.assignments) : null;

      runTransaction(() => {
        db.prepare(`
          INSERT INTO bookings (
            id, code, customer_id, customer_name, school_name, class_name,
            title, shoot_date, start_time, end_time, location, city, district,
            student_count, package_id, package_name, concept,
            photographer_id, photographer_name, assignments_json,
            total_amount, deposit_amount, remaining_amount, payment_status, booking_status,
            deposit_paid, notes, version, is_deleted, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `).run(
          id, body.code || `BK-${id.slice(-6)}`, body.customerId || '', body.customerName || '', body.schoolName || '', body.className || '',
          body.title || `Lịch chụp ${body.className || ''}`, body.shootDate || '', body.startTime || '07:30', body.endTime || '17:00',
          body.location || '', body.city || '', body.district || '', Number(body.studentCount) || 0,
          body.packageId || '', body.packageName || '', body.concept || '',
          body.assignments?.leadPhotographerId || '', body.assignments?.leadPhotographerName || '', assignmentsStr,
          Number(body.totalAmount) || 0, Number(body.depositAmount) || 0, Number(body.remainingAmount) || 0,
          body.paymentStatus || 'Chưa cọc', body.bookingStatus || 'Chờ xác nhận',
          body.depositAmount > 0 ? 1 : 0, body.notes || ''
        );

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'CREATE',
          tableName: 'bookings',
          recordId: id,
          newData: body,
          ipAddress
        });
      });

      const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
      return sendJson(res, 201, { success: true, data: mapDbRowToBooking(created) });
    }

    // PUT /api/bookings/:id
    if (pathname.startsWith('/api/bookings/') && req.method === 'PUT') {
      const id = pathname.replace('/api/bookings/', '').trim();
      const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Lịch chụp không tồn tại' });
      }

      const body = await readJsonBody(req);
      const assignmentsStr = body.assignments ? JSON.stringify(body.assignments) : existing.assignments_json;

      runTransaction(() => {
        db.prepare(`
          UPDATE bookings SET
            title = COALESCE(?, title),
            shoot_date = COALESCE(?, shoot_date),
            start_time = COALESCE(?, start_time),
            end_time = COALESCE(?, end_time),
            location = COALESCE(?, location),
            city = COALESCE(?, city),
            district = COALESCE(?, district),
            student_count = COALESCE(?, student_count),
            package_id = COALESCE(?, package_id),
            package_name = COALESCE(?, package_name),
            concept = COALESCE(?, concept),
            photographer_id = COALESCE(?, photographer_id),
            photographer_name = COALESCE(?, photographer_name),
            assignments_json = COALESCE(?, assignments_json),
            total_amount = COALESCE(?, total_amount),
            deposit_amount = COALESCE(?, deposit_amount),
            remaining_amount = COALESCE(?, remaining_amount),
            payment_status = COALESCE(?, payment_status),
            booking_status = COALESCE(?, booking_status),
            notes = COALESCE(?, notes),
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          toSql(body.title), toSql(body.shootDate), toSql(body.startTime), toSql(body.endTime), toSql(body.location), toSql(body.city), toSql(body.district),
          body.studentCount !== undefined ? Number(body.studentCount) : null,
          toSql(body.packageId), toSql(body.packageName), toSql(body.concept),
          toSql(body.assignments?.leadPhotographerId), toSql(body.assignments?.leadPhotographerName), toSql(assignmentsStr),
          body.totalAmount !== undefined ? Number(body.totalAmount) : null,
          body.depositAmount !== undefined ? Number(body.depositAmount) : null,
          body.remainingAmount !== undefined ? Number(body.remainingAmount) : null,
          toSql(body.paymentStatus), toSql(body.bookingStatus), toSql(body.notes),
          id
        );

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'UPDATE',
          tableName: 'bookings',
          recordId: id,
          oldData: mapDbRowToBooking(existing),
          newData: body,
          ipAddress
        });
      });

      const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
      return sendJson(res, 200, { success: true, data: mapDbRowToBooking(updated) });
    }

    // DELETE /api/bookings/:id (Soft Delete)
    if (pathname.startsWith('/api/bookings/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/bookings/', '').trim();
      runTransaction(() => {
        db.prepare(`
          UPDATE bookings SET 
            is_deleted = 1, 
            deleted_at = CURRENT_TIMESTAMP, 
            deleted_by = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(currentUserName, id);

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'DELETE',
          tableName: 'bookings',
          recordId: id,
          ipAddress
        });
      });
      return sendJson(res, 200, { success: true, message: 'Đã xóa lịch chụp vào thùng rác' });
    }

    // -------------------------------------------------------------
    // 4. AUDIT LOGS, PHOTOGRAPHERS, SALES STAFF
    // -------------------------------------------------------------

    // GET /api/audit-logs
    if (pathname === '/api/audit-logs' && req.method === 'GET') {
      const limit = Math.min(200, parseInt(url.searchParams.get('limit') || '50', 10));
      const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit);
      return sendJson(res, 200, { success: true, data: logs });
    }

    // GET /api/photographers
    if (pathname === '/api/photographers' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM photographers').all();
      return sendJson(res, 200, { success: true, data: rows });
    }

    // GET /api/sales-staff
    if (pathname === '/api/sales-staff' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM sales_staff').all();
      return sendJson(res, 200, { success: true, data: rows });
    }

    // -------------------------------------------------------------
    // 5. DATABASE BACKUPS & EXCEL EXPORTS
    // -------------------------------------------------------------

    // POST /api/backups/create
    if (pathname === '/api/backups/create' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const label = body.label || 'manual';
      const result = await createDatabaseBackup(label);
      if (result.success) {
        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'BACKUP',
          tableName: 'database',
          recordId: result.filename,
          ipAddress
        });
        return sendJson(res, 200, result);
      }
      return sendJson(res, 500, result);
    }

    // GET /api/backups
    if (pathname === '/api/backups' && req.method === 'GET') {
      const backups = listDatabaseBackups();
      return sendJson(res, 200, { success: true, data: backups });
    }

    // -------------------------------------------------------------
    // 6. LEGACY SYNC & EXCEL BACKWARDS COMPATIBILITY
    // -------------------------------------------------------------

    if (pathname === '/api/storage/status' && req.method === 'GET') {
      const customersCount = db.prepare('SELECT COUNT(*) as c FROM customers WHERE is_deleted = 0').get().c;
      const bookingsCount = db.prepare('SELECT COUNT(*) as c FROM bookings WHERE is_deleted = 0').get().c;
      const photographersCount = db.prepare('SELECT COUNT(*) as c FROM photographers').get().c;
      const salesStaffCount = db.prepare('SELECT COUNT(*) as c FROM sales_staff').get().c;

      let dbSizeBytes = 0;
      try { dbSizeBytes = fs.statSync(DB_PATH).size; } catch {}

      const queueStats = getOutboxQueueStats();
      const excelFilesCount = db.prepare("SELECT COUNT(*) as c FROM excel_export_history WHERE status = 'success'").get().c;

      return sendJson(res, 200, {
        success: true,
        primarySource: 'Server SQL (SQLite Database)',
        primaryDatabasePath: DB_PATH,
        zones: {
          zone1_google_sheets: {
            name: 'Google Sheets (Báo Cáo)',
            spreadsheetId: '1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU',
            status: 'connected',
            role: 'Replica'
          },
          zone2_supabase: {
            name: 'Supabase Cloud PostgreSQL',
            status: process.env.VITE_SUPABASE_ANON_KEY ? 'connected' : 'standby_mock',
            role: 'Replica'
          },
          zone3_server_sql: {
            name: 'Server SQL Engine (SQLite Persistent)',
            status: 'active',
            role: 'Primary Source',
            dbSizeBytes,
            records: {
              customers: customersCount,
              bookings: bookingsCount,
              photographers: photographersCount,
              salesStaff: salesStaffCount
            }
          }
        },
        queue: queueStats,
        excelBackups: {
          totalFiles: excelFilesCount,
          backupDir: BACKUP_DIR
        }
      });
    }

    if (pathname === '/api/storage/save-data' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const { customers = [], bookings = [] } = body;

      runTransaction(() => {
        for (const c of customers) {
          const shootingLocStr = Array.isArray(c.shootingLocations) ? JSON.stringify(c.shootingLocations) : (c.shootingLocations || '');
          db.prepare(`
            INSERT INTO customers (
              id, name, phone, email, school_name, class_name,
              province, lead_source, pipeline_stage, assigned_sales_id,
              assigned_sales_name, contract_value, deposit_amount, shoot_date,
              notes, shooting_locations, version, is_deleted, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name, phone=excluded.phone, email=excluded.email,
              school_name=excluded.school_name, class_name=excluded.class_name,
              pipeline_stage=excluded.pipeline_stage, assigned_sales_id=excluded.assigned_sales_id,
              assigned_sales_name=excluded.assigned_sales_name,
              notes=excluded.notes, shooting_locations=excluded.shooting_locations,
              version=excluded.version + 1, updated_at=CURRENT_TIMESTAMP
          `).run(
            c.id, c.name, c.phone || '', c.email || '', c.schoolName || '', c.className || '',
            c.province || c.city || '', c.leadSource || c.source || '', c.pipelineStage || 'New Lead',
            c.assignedSalesId || '', c.assignedSalesName || '', c.contractValue || c.totalRevenue || 0,
            c.depositAmount || c.paidAmount || 0, c.shootDate || '', c.notes || '', shootingLocStr
          );

          enqueueSyncTask({
            entityType: 'customer',
            entityId: c.id,
            action: 'UPSERT',
            payload: c,
            version: 1,
            targetZone: 'google_sheets'
          });
        }

        for (const b of bookings) {
          db.prepare(`
            INSERT INTO bookings (
              id, customer_id, title, shoot_date, shoot_time, location, concept,
              photographer_id, photographer_name, status,
              deposit_paid, total_amount, version, is_deleted, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              customer_id=excluded.customer_id, title=excluded.title, shoot_date=excluded.shoot_date,
              location=excluded.location, photographer_id=excluded.photographer_id,
              status=excluded.status, total_amount=excluded.total_amount,
              version=excluded.version + 1, updated_at=CURRENT_TIMESTAMP
          `).run(
            b.id, b.customerId || '', b.title || 'Lịch Chụp Kỷ Yếu', b.shootDate || '',
            b.shootTime || b.startTime || '', b.location || '', b.concept || '',
            b.assignments?.leadPhotographerId || b.photographerId || '',
            b.assignments?.leadPhotographerName || b.photographerName || '',
            b.bookingStatus || b.status || 'confirmed',
            b.depositAmount > 0 ? 1 : 0, b.totalAmount || 0
          );

          enqueueSyncTask({
            entityType: 'booking',
            entityId: b.id,
            action: 'UPSERT',
            payload: b,
            version: 1,
            targetZone: 'google_sheets'
          });
        }
      });

      return sendJson(res, 200, {
        success: true,
        message: `Đã lưu bền vững ${customers.length} khách hàng & ${bookings.length} lịch chụp vào Server SQLite và xếp hàng đợi Outbox.`
      });
    }

    if (pathname === '/api/storage/export-excel' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const mode = body.mode || 'full';
      const targetMonth = body.targetMonth;
      const result = await exportCrmExcelReport({ mode, targetMonth, exportType: 'manual_admin' });
      return sendJson(res, 200, { success: true, message: 'Đã xuất file Excel thành công!', data: result });
    }

    if (pathname === '/api/storage/excel-history' && req.method === 'GET') {
      const history = db.prepare('SELECT * FROM excel_export_history ORDER BY created_at DESC LIMIT 50').all();
      return sendJson(res, 200, { success: true, history });
    }

    if (pathname.startsWith('/api/storage/download-excel/') && req.method === 'GET') {
      const rawFilename = pathname.replace('/api/storage/download-excel/', '');
      const filename = path.basename(decodeURIComponent(rawFilename));
      const targetFilePath = path.join(BACKUP_DIR, filename);

      if (!fs.existsSync(targetFilePath)) {
        return sendJson(res, 404, { success: false, message: 'File không tồn tại trên server.' });
      }

      const stat = fs.statSync(targetFilePath);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      const readStream = fs.createReadStream(targetFilePath);
      readStream.pipe(res);
      return;
    }

    if (pathname === '/api/storage/sync' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body.action === 'retry_failed') {
        const retried = retryAllFailedTasks();
        return sendJson(res, 200, {
          success: true,
          message: `Đã đưa ${retried} tác vụ lỗi trở lại hàng đợi để đồng bộ lại.`
        });
      }

      const workerRes = await runOutboxWorkerBatch(20);
      return sendJson(res, 200, {
        success: true,
        message: 'Đã thực hiện quét hàng đợi đồng bộ.',
        result: workerRes
      });
    }

    // 404
    sendJson(res, 404, { success: false, message: 'Endpoint không tồn tại' });
  } catch (err) {
    console.error('Server Internal Error:', err);
    sendJson(res, 500, { success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CRM Xoăn Media Server Engine v${VERSION} đang chạy trên cổng ${PORT}`);
  console.log(`📁 Cơ sở dữ liệu Primary SQLite: ${DB_PATH}`);
  console.log(`💾 Kho sao lưu DB tự động: ${DB_BACKUP_DIR}`);
  console.log(`📊 Google Sheets kết nối: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU`);
  console.log(`📁 Kho sao lưu Excel (.xlsx): ${BACKUP_DIR}`);
  console.log(`=======================================================`);

  startMonthlyCronScheduler();

  setInterval(() => {
    runOutboxWorkerBatch(10).catch(err => {
      console.error('Lỗi Outbox Worker loop:', err.message);
    });
  }, 10 * 1000);
});
