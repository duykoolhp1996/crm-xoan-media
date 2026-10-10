import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { db, BACKUP_DIR, DB_BACKUP_DIR, DB_PATH, logAudit, runTransaction, verifyProductionSafety, getActiveRentalProducts, saveRentalProduct, softDeleteRentalProduct } from './db.mjs';
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
const VERSION = '1.3.1';

// Thư mục lưu trữ tĩnh bền vững (nằm trong server/data/ nên không bị rsync đè mất)
const UPLOADS_DIR = path.resolve(path.dirname(DB_PATH), 'uploads');
const AVATARS_DIR = path.resolve(UPLOADS_DIR, 'avatars');
const RENTAL_DIR = path.resolve(UPLOADS_DIR, 'rental');
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}
if (!fs.existsSync(RENTAL_DIR)) {
  fs.mkdirSync(RENTAL_DIR, { recursive: true });
}

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

// Helper chuẩn hóa số tiền từ chuỗi linh hoạt (100000, 100.000, 1,500,000, 1.500.000đ -> 1500000)
const parseNumericAmount = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.max(0, val);
  if (!val) return 0;
  const cleaned = String(val).replace(/[^\d.-]/g, '').replace(/(\..*)\./g, '$1');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
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

  const studentCount = Number(row.student_count) || 0;
  const unitPrice = (row.unit_price !== null && row.unit_price !== undefined) ? Number(row.unit_price) : 0;
  const extraFee = (row.extra_fee !== null && row.extra_fee !== undefined) ? Number(row.extra_fee) : 0;
  const discount = (row.discount !== null && row.discount !== undefined) ? Number(row.discount) : 0;
  const subtotal = (row.subtotal !== null && row.subtotal !== undefined) ? Number(row.subtotal) : Math.max(0, studentCount * unitPrice);

  let totalAmount = 0;
  if (row.total_amount !== null && row.total_amount !== undefined) {
    totalAmount = Number(row.total_amount);
  } else if (row.total_revenue !== null && row.total_revenue !== undefined) {
    totalAmount = Number(row.total_revenue);
  } else if (row.contract_value !== null && row.contract_value !== undefined) {
    totalAmount = Number(row.contract_value);
  } else if (row.expected_budget !== null && row.expected_budget !== undefined) {
    totalAmount = Number(row.expected_budget);
  } else {
    totalAmount = Math.max(0, subtotal + extraFee - discount);
  }

  const depositAmount = (row.deposit_amount !== null && row.deposit_amount !== undefined)
    ? Number(row.deposit_amount)
    : ((row.paid_amount !== null && row.paid_amount !== undefined) ? Number(row.paid_amount) : 0);
  const remainingAmount = (row.remaining_amount !== null && row.remaining_amount !== undefined)
    ? Number(row.remaining_amount)
    : Math.max(0, totalAmount - depositAmount);
  const expectedBudget = (row.expected_budget !== null && row.expected_budget !== undefined)
    ? Number(row.expected_budget)
    : totalAmount;

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
    studentCount,
    serviceType: row.service_type || 'Kỷ yếu Concept',
    servicePackageId: row.service_package_id || '',
    servicePackageName: row.service_package_name || '',
    concept: row.concept || '',
    expectedShootDate: row.expected_shoot_date || '',
    shootingLocations,
    expectedBudget,
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

    // Hệ thống Tài chính & Bộ Tính Giá Tự Động
    unitPrice,
    subtotal,
    extraFee,
    discount,
    totalAmount,
    totalRevenue: totalAmount,
    depositAmount,
    paidAmount: depositAmount,
    contractValue: totalAmount,
    remainingAmount,

    // Giai đoạn cụ thể (Stage-specific)
    depositDate: row.deposit_date || '',
    paymentMethod: row.payment_method || '',
    shootTime: row.shoot_time || '',
    shootAddress: row.shoot_address || '',
    editorName: row.editor_name || '',
    editDeadline: row.edit_deadline || '',
    editProgress: Number(row.edit_progress) || 0,
    deliveredDate: row.delivered_date || '',
    deliveredDriveUrl: row.delivered_drive_url || '',
    deliveryMethod: row.delivery_method || '',
    lostReason: row.lost_reason || '',
    lostNote: row.lost_note || '',

    // Soft delete & Thùng rác
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at || undefined,
    deletedBy: row.deleted_by || undefined,
    deleteReason: row.delete_reason || '',

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

const mapDbRowToPhotographer = (row) => {
  if (!row) return null;
  let skills = ['Chụp chính'];
  let activeRegions = ['Hải Phòng'];
  let equipmentList = [];
  try {
    if (row.skills_json) skills = JSON.parse(row.skills_json);
  } catch {}
  try {
    if (row.active_regions_json) activeRegions = JSON.parse(row.active_regions_json);
  } catch {}
  try {
    if (row.equipment_list_json) equipmentList = JSON.parse(row.equipment_list_json);
  } catch {}

  return {
    id: row.id,
    fullName: row.full_name || '',
    phone: row.phone || '',
    email: row.email || '',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: Number(row.rating) || 5.0,
    completedShootsCount: Number(row.completed_shoots_count) || 0,
    photographerType: row.photographer_type || 'Freelancer',
    experienceYears: Number(row.experience_years) || 1,
    skills,
    activeRegions,
    equipmentList,
    ratePerShoot: Number(row.rate_per_shoot) || 0,
    salaryType: row.salary_type || 'per_shoot',
    monthlySalary: Number(row.monthly_salary) || 0,
    status: row.status || 'available',
    notes: row.notes || '',
    username: row.username || '',
    password: row.password || '',
    canLogin: row.can_login === 1 || row.can_login === true || row.can_login === '1',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined
  };
};

const mapDbRowToSalesStaff = (row) => {
  if (!row) return null;
  let activeRegions = ['Hải Phòng'];
  try {
    if (row.active_regions_json) activeRegions = JSON.parse(row.active_regions_json);
  } catch {}

  return {
    id: row.id,
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || '',
    roleTitle: row.role_title || 'Chuyên viên Sales Tư Vấn',
    commissionType: row.commission_type || 'percentage',
    commissionRate: Number(row.commission_rate) || 0,
    commissionFixedAmount: Number(row.commission_fixed_amount) || 0,
    status: row.status || 'active',
    username: row.username || '',
    password: row.password || '',
    canLogin: row.can_login === 1 || row.can_login === true || row.can_login === '1',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    activeRegions,
    leaderId: row.leader_id || undefined,
    leaderName: row.leader_name || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined
  };
};

const mapDbRowToNotification = (row) => {
  if (!row) return null;
  let metadata = undefined;
  try {
    if (row.metadata_json) metadata = JSON.parse(row.metadata_json);
  } catch {}

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    bookingId: row.booking_id || undefined,
    customerId: row.customer_id || undefined,
    targetUserId: row.target_user_id || undefined,
    targetRole: row.target_role || undefined,
    severity: row.severity || 'info',
    timestamp: row.timestamp || row.created_at,
    read: Boolean(row.read),
    metadata
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
  const searchParams = url.searchParams;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const currentUserId = req.headers['x-user-id'] || 'system';
  const currentUserName = req.headers['x-user-name'] || 'Người dùng CRM';

  try {
    // -------------------------------------------------------------
    // STATIC FILE SERVING CHO UPLOADS (Avatar, Media, Rental)
    // -------------------------------------------------------------
    if ((pathname.startsWith('/uploads/') || pathname.startsWith('/api/uploads/')) && (req.method === 'GET' || req.method === 'HEAD')) {
      const cleanPath = pathname.replace(/^\/api/, '');
      const relativePath = cleanPath.replace('/uploads/', '').replace(/\.\./g, '');
      const filePath = path.resolve(UPLOADS_DIR, relativePath);

      if (!filePath.startsWith(UPLOADS_DIR)) {
        return sendJson(res, 403, { success: false, message: 'Forbidden path' });
      }

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return sendJson(res, 404, { success: false, message: 'File không tồn tại trên hệ thống' });
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*'
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      return fs.createReadStream(filePath).pipe(res);
    }

    // -------------------------------------------------------------
    // UPLOAD REST API
    // -------------------------------------------------------------
    if (pathname === '/api/upload/avatar' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const { base64Data, fileType = 'image/jpeg', fileName = 'avatar.jpg', userId = '' } = body;

      if (!base64Data) {
        return sendJson(res, 400, { success: false, message: 'Dữ liệu ảnh base64Data là bắt buộc' });
      }

      const base64Clean = String(base64Data).replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');

      if (buffer.length > 5 * 1024 * 1024) {
        return sendJson(res, 400, { success: false, message: 'Dung lượng ảnh vượt quá giới hạn 5MB' });
      }

      let ext = '.jpg';
      if (fileType.includes('png') || fileName.endsWith('.png')) ext = '.png';
      else if (fileType.includes('webp') || fileName.endsWith('.webp')) ext = '.webp';

      const safeId = userId ? String(userId).replace(/[^a-zA-Z0-9_-]/g, '') : 'user';
      const safeFileName = `avatar_${safeId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
      const targetFilePath = path.join(AVATARS_DIR, safeFileName);

      fs.writeFileSync(targetFilePath, buffer);

      const avatarUrl = `/uploads/avatars/${safeFileName}`;
      const fullUrl = `https://crm.xoanmedia.com${avatarUrl}`;

      logAudit({
        userId: currentUserId,
        userName: currentUserName,
        action: 'UPLOAD_AVATAR',
        tableName: 'uploads',
        recordId: safeFileName,
        newData: JSON.stringify({ fileName: safeFileName, sizeBytes: buffer.length, userId }),
        ipAddress
      });

      return sendJson(res, 200, {
        success: true,
        data: {
          url: fullUrl,
          relativePath: avatarUrl,
          fullUrl,
          fileName: safeFileName,
          sizeBytes: buffer.length
        },
        message: 'Tải lên ảnh đại diện thành công!'
      });
    }

    // -------------------------------------------------------------
    // XOĂN RENTAL REST APIS (LƯU TRỮ DATABASE VĨNH VIỄN - ZERO DATA LOSS)
    // -------------------------------------------------------------
    // 1. GET: Lấy danh sách sản phẩm active từ SQLite Database
    if (pathname === '/api/rental/products' && req.method === 'GET') {
      const products = getActiveRentalProducts();
      return sendJson(res, 200, {
        success: true,
        count: products.length,
        data: products
      });
    }

    // 2. POST: Thêm mới hoặc cập nhật sản phẩm (lưu ảnh vào đĩa, không bao giờ mất)
    if (pathname === '/api/rental/products' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.id || !body.name || !body.price) {
        return sendJson(res, 400, { success: false, message: 'Thiếu trường bắt buộc (id, name, price)' });
      }

      // Xử lý lưu ảnh nếu là Base64
      let mainImage = body.image || '';
      if (mainImage && mainImage.startsWith('data:image/')) {
        try {
          const match = mainImage.match(/^data:image\/([a-zA-Z+]+);base64,/);
          const ext = match ? (match[1] === 'jpeg' ? 'jpg' : match[1]) : 'webp';
          const base64Data = mainImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const cleanSku = String(body.id).replace(/[^a-zA-Z0-9_-]/g, '');
          const filename = `${cleanSku}-${Date.now()}.${ext}`;
          const filePath = path.join(RENTAL_DIR, filename);
          fs.writeFileSync(filePath, buffer);
          mainImage = `/uploads/rental/${filename}`;
        } catch (imgErr) {
          console.warn('[Rental] Lưu file ảnh thất bại:', imgErr.message);
        }
      }

      const productToSave = {
        ...body,
        image: mainImage,
        gallery: [mainImage]
      };

      const result = saveRentalProduct(productToSave, currentUserName || 'admin');
      return sendJson(res, 200, {
        success: true,
        message: result.action === 'created' ? 'Đã thêm mới trang phục vào Database thành công' : 'Đã cập nhật trang phục trong Database thành công',
        version: result.version,
        data: productToSave
      });
    }

    // 3. DELETE: Soft-delete an toàn có xác thực mật khẩu Admin
    if (pathname.startsWith('/api/rental/products/') && req.method === 'DELETE') {
      const prodId = pathname.replace('/api/rental/products/', '').trim();
      const body = await readJsonBody(req).catch(() => ({}));
      const providedPass = req.headers['x-admin-password'] || body.adminPassword || '';

      // Kiểm tra mật khẩu Admin xác nhận (chống thao tác nhầm hoặc tấn công trái phép)
      if (providedPass !== 'xoanmedia2026') {
        return sendJson(res, 403, {
          success: false,
          message: 'Lỗi bảo mật: Cần mật khẩu xác nhận của Admin mới được phép thao tác xóa!'
        });
      }

      const result = softDeleteRentalProduct(prodId, currentUserName || 'admin');
      return sendJson(res, 200, {
        success: true,
        message: result.message
      });
    }

    // -------------------------------------------------------------
    // FACEBOOK MESSENGER WEBHOOK (Realtime Push Events)
    // -------------------------------------------------------------
    const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'xoanmedia_meta_webhook_2026';

    // 1. GET: Xác thực Webhook với Meta Developer (hub.challenge)
    if ((pathname === '/api/facebook/webhook' || pathname === '/api/webhook/facebook') && req.method === 'GET') {
      const mode = searchParams.get('hub.mode');
      const token = searchParams.get('hub.verify_token');
      const challenge = searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
        console.log('[Facebook Webhook] Xác thực thành công với Meta!');
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(challenge);
        return;
      } else {
        console.warn(`[Facebook Webhook] Xác thực thất bại! Token không khớp (nhận: ${token})`);
        return sendJson(res, 403, { success: false, message: 'Forbidden: Invalid verify token' });
      }
    }

    // 2. GET: Trạng thái cấu hình Webhook Facebook
    if (pathname === '/api/facebook/webhook/status' && req.method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        webhookUrl: 'https://crm.xoanmedia.com/api/facebook/webhook',
        verifyToken: FB_VERIFY_TOKEN,
        appId: '1438809894822067',
        pageId: '111065964964204',
        subscribedFields: ['messages', 'messaging_postbacks', 'message_reads', 'message_deliveries']
      });
    }

    // 3. POST: Nhận sự kiện tin nhắn từ Facebook Messenger (Realtime)
    if ((pathname === '/api/facebook/webhook' || pathname === '/api/webhook/facebook') && req.method === 'POST') {
      const body = await readJsonBody(req);

      if (body.object === 'page') {
        // Meta yêu cầu phản hồi 200 OK ngay lập tức (trong vòng 20s) để tránh bị timeout/retry
        sendJson(res, 200, { success: true, message: 'EVENT_RECEIVED' });

        // Xử lý sự kiện tin nhắn trong background
        try {
          if (Array.isArray(body.entry)) {
            for (const entry of body.entry) {
              const pageId = entry.id;
              const messagingEvents = entry.messaging || [];
              for (const event of messagingEvents) {
                const senderId = event.sender?.id; // PSID khách hàng
                const message = event.message;

                if (message && message.text) {
                  console.log(`[Facebook Webhook] Tin nhắn mới từ PSID ${senderId} tới Fanpage ${pageId}: "${message.text}"`);
                }
              }
            }
          }
        } catch (eventErr) {
          console.error('[Facebook Webhook] Lỗi xử lý sự kiện:', eventErr);
        }
        return;
      } else {
        return sendJson(res, 404, { success: false, message: 'Not Found' });
      }
    }

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

    // GET /api/customers/deleted - Lấy danh sách khách hàng trong thùng rác (Đã xóa / Soft Delete)
    if (pathname === '/api/customers/deleted' && req.method === 'GET') {
      const rows = db.prepare(`
        SELECT * FROM customers 
        WHERE is_deleted = 1 
        ORDER BY deleted_at DESC, updated_at DESC
      `).all();
      return sendJson(res, 200, {
        success: true,
        data: rows.map(mapDbRowToCustomer),
        total: rows.length
      });
    }

    // GET /api/customers/:id/stage-history - Lấy lịch sử thay đổi giai đoạn Lead
    if (pathname.match(/^\/api\/customers\/[^/]+\/stage-history$/) && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const rows = db.prepare(`
        SELECT * FROM lead_stage_history 
        WHERE lead_id = ? 
        ORDER BY changed_at ASC
      `).all(id);
      return sendJson(res, 200, { success: true, data: rows });
    }

    // POST /api/customers/:id/change-stage - Đổi giai đoạn Lead & Ghi nhận lịch sử
    if (pathname.match(/^\/api\/customers\/[^/]+\/change-stage$/) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Khách hàng không tồn tại' });
      }

      const body = await readJsonBody(req);
      const newStage = body.newStage || body.stage;
      if (!newStage) {
        return sendJson(res, 400, { success: false, message: 'newStage là bắt buộc' });
      }

      const prevStage = existing.pipeline_stage;
      const isLeadOrLost = newStage === 'New Lead' || newStage === 'Lost';
      runTransaction(() => {
        if (isLeadOrLost) {
          db.prepare(`
            UPDATE customers SET 
              pipeline_stage = ?,
              deposit_amount = 0,
              paid_amount = 0,
              remaining_amount = 0,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(newStage, id);
        } else {
          db.prepare(`
            UPDATE customers SET 
              pipeline_stage = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(newStage, id);
        }

        const histId = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        db.prepare(`
          INSERT INTO lead_stage_history (id, lead_id, from_stage, to_stage, changed_by, changed_by_id, changed_at, note)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        `).run(histId, id, prevStage, newStage, currentUserName, currentUserId, body.note || null);

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'CHANGE_STAGE',
          tableName: 'customers',
          recordId: id,
          oldData: { pipelineStage: prevStage },
          newData: { pipelineStage: newStage, note: body.note },
          ipAddress
        });
      });

      const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      return sendJson(res, 200, { success: true, data: mapDbRowToCustomer(updated) });
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

    // POST /api/customers - Tạo mới khách hàng (Kèm bộ tính giá tự động Backend)
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

      // BACKEND PRICING ENGINE: Tính toán tự động chuẩn xác
      const studentCount = parseInt(body.studentCount ?? body.student_count ?? 0, 10);
      const unitPrice = parseNumericAmount(body.unitPrice ?? body.unit_price ?? 0);
      const extraFee = parseNumericAmount(body.extraFee ?? body.extra_fee ?? 0);
      const discount = parseNumericAmount(body.discount ?? 0);
      const depositAmount = parseNumericAmount(body.depositAmount ?? body.deposit_amount ?? body.paidAmount ?? 0);

      const subtotal = Math.max(0, studentCount * unitPrice);
      let totalAmount = 0;
      if (body.unitPrice !== undefined || body.unit_price !== undefined) {
        totalAmount = Math.max(0, subtotal + extraFee - discount);
      } else if (body.totalAmount !== undefined || body.total_amount !== undefined || body.totalRevenue !== undefined) {
        totalAmount = parseNumericAmount(body.totalAmount ?? body.total_amount ?? body.totalRevenue);
      } else if (body.expectedBudget !== undefined) {
        totalAmount = parseNumericAmount(body.expectedBudget);
      } else {
        totalAmount = Math.max(0, subtotal + extraFee - discount);
      }
      const stage = body.pipelineStage || body.pipeline_stage || 'New Lead';
      const isClosedStage = ['Đã cọc', 'Đã đặt cọc', 'Book ngày', 'Đã Booking', 'Đã chụp', 'Đang hậu kỳ', 'Giao ảnh', 'Đã bàn giao', 'Hoàn thành'].includes(stage);
      const remainingAmount = (isClosedStage || depositAmount > 0)
        ? Math.max(0, totalAmount - depositAmount)
        : 0;

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
            unit_price, subtotal, extra_fee, discount, total_amount, remaining_amount,
            deposit_date, payment_method, shoot_time, shoot_address,
            editor_name, edit_deadline, edit_progress,
            delivered_date, delivered_drive_url, delivery_method,
            lost_reason, lost_note,
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
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `);

        stmt.run(
          id, body.name, body.phone || '', body.email || '', body.facebook || '', body.tiktok || '', body.zalo || '',
          body.schoolId || '', body.schoolName || '', body.grade || 'Khối 12', body.className || '', body.academicYear || '2025-2026',
          body.region || '', body.city || '', body.district || '', body.representativeRole || 'Lớp trưởng', studentCount,
          body.serviceType || 'Kỷ yếu Concept', body.servicePackageId || '', body.servicePackageName || '', body.concept || '',
          body.expectedShootDate || '', shootingLocationsStr, totalAmount, body.specialRequests || '', body.notes || '',
          body.rawDriveUrl || '', body.driveUrl || '', body.photoNotes || '', body.shotDate || '', Number(body.photoCount) || 0,
          body.source || 'Facebook Ads', body.campaignName || '', utmStr,
          body.pipelineStage || 'New Lead', body.assignedSalesId || '', body.assignedSalesName || 'Chưa gán',
          body.assignedCareStaffId || '', body.assignedCareStaffName || '',
          currentUserId, currentUserName,
          totalAmount, depositAmount, totalAmount, depositAmount,
          unitPrice, subtotal, extraFee, discount, totalAmount, remainingAmount,
          body.depositDate || null, body.paymentMethod || null, body.shootTime || null, body.shootAddress || null,
          body.editorName || null, body.editDeadline || null, Number(body.editProgress) || 0,
          body.deliveredDate || null, body.deliveredDriveUrl || null, body.deliveryMethod || null,
          body.lostReason || null, body.lostNote || null
        );

        // Ghi nhận stage đầu tiên vào history
        const histId = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        db.prepare(`
          INSERT INTO lead_stage_history (id, lead_id, from_stage, to_stage, changed_by, changed_by_id, changed_at, note)
          VALUES (?, ?, NULL, ?, ?, ?, CURRENT_TIMESTAMP, 'Tạo mới Lead')
        `).run(histId, id, body.pipelineStage || 'New Lead', currentUserName, currentUserId);

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'CREATE_LEAD',
          tableName: 'customers',
          recordId: id,
          newData: body,
          ipAddress
        });
      });

      const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      return sendJson(res, 201, { success: true, data: mapDbRowToCustomer(created) });
    }

    // PUT /api/customers/:id - Sửa thông tin khách hàng (Cập nhật và tính lại giá tự động)
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

      // BACKEND PRICING ENGINE: Tính toán lại giá tự động
      const studentCount = parseInt(body.studentCount ?? body.student_count ?? existing.student_count ?? 0, 10);
      const hasUnitPriceProvided = (body.unitPrice !== undefined || body.unit_price !== undefined);
      const unitPrice = hasUnitPriceProvided
        ? parseNumericAmount(body.unitPrice ?? body.unit_price)
        : parseNumericAmount(existing.unit_price ?? 0);
      const extraFee = (body.extraFee !== undefined || body.extra_fee !== undefined)
        ? parseNumericAmount(body.extraFee ?? body.extra_fee)
        : parseNumericAmount(existing.extra_fee ?? 0);
      const discount = body.discount !== undefined
        ? parseNumericAmount(body.discount)
        : parseNumericAmount(existing.discount ?? 0);
      const depositAmount = (body.depositAmount !== undefined || body.deposit_amount !== undefined || body.paidAmount !== undefined)
        ? parseNumericAmount(body.depositAmount ?? body.deposit_amount ?? body.paidAmount)
        : parseNumericAmount(existing.deposit_amount ?? existing.paid_amount ?? 0);

      const subtotal = Math.max(0, studentCount * unitPrice);
      let totalAmount = 0;
      if (hasUnitPriceProvided) {
        totalAmount = Math.max(0, subtotal + extraFee - discount);
      } else if (body.totalAmount !== undefined || body.total_amount !== undefined || body.totalRevenue !== undefined) {
        totalAmount = parseNumericAmount(body.totalAmount ?? body.total_amount ?? body.totalRevenue);
      } else if (body.expectedBudget !== undefined) {
        totalAmount = parseNumericAmount(body.expectedBudget);
      } else {
        totalAmount = Math.max(0, subtotal + extraFee - discount);
      }
      const finalStage = body.pipelineStage ?? body.pipeline_stage ?? existing.pipeline_stage;
      const isClosedStage = ['Đã cọc', 'Đã đặt cọc', 'Book ngày', 'Đã Booking', 'Đã chụp', 'Đang hậu kỳ', 'Giao ảnh', 'Đã bàn giao', 'Hoàn thành'].includes(finalStage);
      const remainingAmount = (isClosedStage || depositAmount > 0)
        ? Math.max(0, totalAmount - depositAmount)
        : 0;

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
            student_count = ?,
            service_type = COALESCE(?, service_type),
            service_package_id = COALESCE(?, service_package_id),
            service_package_name = COALESCE(?, service_package_name),
            concept = COALESCE(?, concept),
            expected_shoot_date = COALESCE(?, expected_shoot_date),
            shooting_locations = COALESCE(?, shooting_locations),
            expected_budget = ?,
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
            contract_value = ?,
            deposit_amount = ?,
            total_revenue = ?,
            paid_amount = ?,
            unit_price = ?,
            subtotal = ?,
            extra_fee = ?,
            discount = ?,
            total_amount = ?,
            remaining_amount = ?,
            deposit_date = COALESCE(?, deposit_date),
            payment_method = COALESCE(?, payment_method),
            shoot_time = COALESCE(?, shoot_time),
            shoot_address = COALESCE(?, shoot_address),
            editor_name = COALESCE(?, editor_name),
            edit_deadline = COALESCE(?, edit_deadline),
            edit_progress = COALESCE(?, edit_progress),
            delivered_date = COALESCE(?, delivered_date),
            delivered_drive_url = COALESCE(?, delivered_drive_url),
            delivery_method = COALESCE(?, delivery_method),
            lost_reason = COALESCE(?, lost_reason),
            lost_note = COALESCE(?, lost_note),
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
          toSql(body.region), toSql(body.city), toSql(body.district), toSql(body.representativeRole),
          studentCount,
          toSql(body.serviceType), toSql(body.servicePackageId), toSql(body.servicePackageName), toSql(body.concept),
          toSql(body.expectedShootDate), toSql(shootingLocationsStr),
          totalAmount,
          toSql(body.specialRequests), toSql(body.notes),
          toSql(body.rawDriveUrl), toSql(body.driveUrl), toSql(body.photoNotes), toSql(body.shotDate), body.photoCount !== undefined ? Number(body.photoCount) : null,
          toSql(body.source), toSql(body.campaignName), toSql(utmStr),
          toSql(body.pipelineStage), toSql(body.assignedSalesId), toSql(body.assignedSalesName),
          toSql(body.assignedCareStaffId), toSql(body.assignedCareStaffName),
          totalAmount, depositAmount, totalAmount, depositAmount,
          unitPrice, subtotal, extraFee, discount, totalAmount, remainingAmount,
          toSql(body.depositDate), toSql(body.paymentMethod), toSql(body.shootTime), toSql(body.shootAddress),
          toSql(body.editorName), toSql(body.editDeadline), body.editProgress !== undefined ? Number(body.editProgress) : null,
          toSql(body.deliveredDate), toSql(body.deliveredDriveUrl), toSql(body.deliveryMethod),
          toSql(body.lostReason), toSql(body.lostNote),
          toSql(body.lastContactedAt),
          id
        );

        // Nếu stage thay đổi, ghi vào lead_stage_history
        if (body.pipelineStage && body.pipelineStage !== existing.pipeline_stage) {
          const histId = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          db.prepare(`
            INSERT INTO lead_stage_history (id, lead_id, from_stage, to_stage, changed_by, changed_by_id, changed_at, note)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
          `).run(histId, id, existing.pipeline_stage, body.pipelineStage, currentUserName, currentUserId, body.stageNote || null);
        }

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'UPDATE_LEAD',
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

    // DELETE /api/customers/:id/permanent - Xóa vĩnh viễn (Chỉ Admin / Super Admin)
    if (pathname.match(/^\/api\/customers\/[^/]+\/permanent$/) && req.method === 'DELETE') {
      const id = pathname.split('/')[3];
      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Khách hàng không tồn tại' });
      }

      const body = await readJsonBody(req).catch(() => ({}));
      const reason = body.reason || 'Xóa vĩnh viễn bởi Quản trị viên';

      runTransaction(() => {
        // Ghi audit log trước khi xóa
        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'PERMANENT_DELETE_LEAD',
          tableName: 'customers',
          recordId: id,
          oldData: mapDbRowToCustomer(existing),
          newData: { reason },
          ipAddress
        });

        // Xóa các stage history liên quan
        db.prepare('DELETE FROM lead_stage_history WHERE lead_id = ?').run(id);

        // Xóa vật lý khỏi SQLite
        db.prepare('DELETE FROM customers WHERE id = ?').run(id);
      });

      return sendJson(res, 200, { success: true, message: 'Đã xóa vĩnh viễn Lead khỏi cơ sở dữ liệu' });
    }

    // DELETE /api/customers/:id - Soft Delete an toàn (Chuyển vào thùng rác)
    if (pathname.startsWith('/api/customers/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/customers/', '').trim();
      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Khách hàng không tồn tại' });
      }

      const body = await readJsonBody(req).catch(() => ({}));
      const reason = body.reason || '';

      runTransaction(() => {
        db.prepare(`
          UPDATE customers SET 
            is_deleted = 1, 
            deleted_at = CURRENT_TIMESTAMP, 
            deleted_by = ?,
            delete_reason = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(currentUserName, reason, id);

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'DELETE_LEAD',
          tableName: 'customers',
          recordId: id,
          oldData: mapDbRowToCustomer(existing),
          newData: { reason },
          ipAddress
        });
      });

      return sendJson(res, 200, { success: true, message: 'Đã chuyển khách hàng vào thùng rác (Soft Delete)' });
    }

    // POST /api/customers/:id/restore - Khôi phục từ thùng rác
    if (pathname.match(/^\/api\/customers\/[^/]+\/restore$/) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Khách hàng không tồn tại' });
      }

      runTransaction(() => {
        db.prepare(`
          UPDATE customers SET 
            is_deleted = 0, 
            deleted_at = NULL, 
            deleted_by = NULL,
            delete_reason = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(id);

        logAudit({
          userId: currentUserId,
          userName: currentUserName,
          action: 'RESTORE_LEAD',
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

    // -------------------------------------------------------------
    // PHOTOGRAPHERS API (CRUD - Quản lý nhân sự & Thùy lao / Lương thưởng Thợ)
    // -------------------------------------------------------------

    // GET /api/photographers
    if (pathname === '/api/photographers' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM photographers ORDER BY full_name ASC').all();
      return sendJson(res, 200, { success: true, data: rows.map(mapDbRowToPhotographer) });
    }

    // POST /api/photographers
    if (pathname === '/api/photographers' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const newId = body.id || `photo-${Date.now()}`;
      const fullName = (body.fullName || body.name || 'Thợ Chụp Mới').trim();
      const phone = (body.phone || '').trim();
      const email = (body.email || '').trim();
      const photoType = body.photographerType || 'Freelancer';
      const rating = Number(body.rating) || 5.0;
      const completedCount = Number(body.completedShootsCount) || 0;
      const ratePerShoot = Number(body.ratePerShoot) || 0;
      const salaryType = body.salaryType || 'per_shoot';
      const monthlySalary = Number(body.monthlySalary) || 0;
      const status = body.status || 'available';
      const skillsJson = JSON.stringify(Array.isArray(body.skills) ? body.skills : ['Chụp chính']);
      const activeRegionsJson = JSON.stringify(Array.isArray(body.activeRegions) ? body.activeRegions : ['Hải Phòng']);
      const equipmentListJson = JSON.stringify(Array.isArray(body.equipmentList) ? body.equipmentList : []);
      const avatar = body.avatar || '';
      const expYears = Number(body.experienceYears) || 1;
      const notes = (body.notes || '').trim();
      const username = (body.username || '').trim();
      const password = (body.password || '').trim();
      const canLogin = body.canLogin !== false ? 1 : 0;

      const stmt = db.prepare(`
        INSERT INTO photographers (
          id, full_name, phone, email, photographer_type, rating, completed_shoots_count,
          rate_per_shoot, salary_type, monthly_salary, status, skills_json, active_regions_json,
          equipment_list_json, avatar, experience_years, notes, username, password, can_login,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        newId, fullName, phone, email, photoType, rating, completedCount,
        ratePerShoot, salaryType, monthlySalary, status, skillsJson, activeRegionsJson,
        equipmentListJson, avatar, expYears, notes, username, password, canLogin
      );

      const created = db.prepare('SELECT * FROM photographers WHERE id = ?').get(newId);
      logAudit({
        userId: currentUserId,
        userName: currentUserName,
        action: 'CREATE_PHOTOGRAPHER',
        tableName: 'photographers',
        recordId: newId,
        newData: mapDbRowToPhotographer(created),
        ipAddress: req.socket.remoteAddress
      });

      return sendJson(res, 201, { success: true, data: mapDbRowToPhotographer(created) });
    }

    // PUT /api/photographers/:id
    if (pathname.startsWith('/api/photographers/') && req.method === 'PUT') {
      const photoId = decodeURIComponent(pathname.replace('/api/photographers/', ''));
      const existing = db.prepare('SELECT * FROM photographers WHERE id = ?').get(photoId);
      if (!existing) {
        return sendJson(res, 404, { success: false, error: 'Không tìm thấy Photographer với ID này' });
      }

      const body = await readJsonBody(req);
      const fullName = (body.fullName !== undefined ? body.fullName : existing.full_name || '').trim();
      const phone = body.phone !== undefined ? body.phone.trim() : existing.phone;
      const email = body.email !== undefined ? body.email.trim() : existing.email;
      const photoType = body.photographerType !== undefined ? body.photographerType : existing.photographer_type;
      const rating = body.rating !== undefined ? Number(body.rating) : existing.rating;
      const completedCount = body.completedShootsCount !== undefined ? Number(body.completedShootsCount) : existing.completed_shoots_count;
      const ratePerShoot = body.ratePerShoot !== undefined ? Number(body.ratePerShoot) : existing.rate_per_shoot;
      const salaryType = body.salaryType !== undefined ? body.salaryType : existing.salary_type;
      const monthlySalary = body.monthlySalary !== undefined ? Number(body.monthlySalary) : existing.monthly_salary;
      const status = body.status !== undefined ? body.status : existing.status;
      const skillsJson = body.skills !== undefined ? JSON.stringify(body.skills) : existing.skills_json;
      const activeRegionsJson = body.activeRegions !== undefined ? JSON.stringify(body.activeRegions) : existing.active_regions_json;
      const equipmentListJson = body.equipmentList !== undefined ? JSON.stringify(body.equipmentList) : existing.equipment_list_json;
      const avatar = body.avatar !== undefined ? body.avatar : existing.avatar;
      const expYears = body.experienceYears !== undefined ? Number(body.experienceYears) : existing.experience_years;
      const notes = body.notes !== undefined ? body.notes.trim() : existing.notes;
      const username = body.username !== undefined ? body.username.trim() : existing.username;
      const password = body.password !== undefined ? body.password.trim() : existing.password;
      const canLogin = body.canLogin !== undefined ? (body.canLogin ? 1 : 0) : existing.can_login;

      const stmt = db.prepare(`
        UPDATE photographers
        SET
          full_name = ?,
          phone = ?,
          email = ?,
          photographer_type = ?,
          rating = ?,
          completed_shoots_count = ?,
          rate_per_shoot = ?,
          salary_type = ?,
          monthly_salary = ?,
          status = ?,
          skills_json = ?,
          active_regions_json = ?,
          equipment_list_json = ?,
          avatar = ?,
          experience_years = ?,
          notes = ?,
          username = ?,
          password = ?,
          can_login = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        fullName, phone, email, photoType, rating, completedCount,
        ratePerShoot, salaryType, monthlySalary, status, skillsJson, activeRegionsJson,
        equipmentListJson, avatar, expYears, notes, username, password, canLogin,
        photoId
      );

      const updated = db.prepare('SELECT * FROM photographers WHERE id = ?').get(photoId);
      logAudit({
        userId: currentUserId,
        userName: currentUserName,
        action: 'UPDATE_PHOTOGRAPHER',
        tableName: 'photographers',
        recordId: photoId,
        oldData: mapDbRowToPhotographer(existing),
        newData: mapDbRowToPhotographer(updated),
        ipAddress: req.socket.remoteAddress
      });

      return sendJson(res, 200, { success: true, data: mapDbRowToPhotographer(updated) });
    }

    // DELETE /api/photographers/:id
    if (pathname.startsWith('/api/photographers/') && req.method === 'DELETE') {
      const photoId = decodeURIComponent(pathname.replace('/api/photographers/', ''));
      const existing = db.prepare('SELECT * FROM photographers WHERE id = ?').get(photoId);
      if (!existing) {
        return sendJson(res, 404, { success: false, error: 'Không tìm thấy Photographer' });
      }

      db.prepare('DELETE FROM photographers WHERE id = ?').run(photoId);
      logAudit({
        userId: currentUserId,
        userName: currentUserName,
        action: 'DELETE_PHOTOGRAPHER',
        tableName: 'photographers',
        recordId: photoId,
        oldData: mapDbRowToPhotographer(existing),
        ipAddress: req.socket.remoteAddress
      });

      return sendJson(res, 200, { success: true, message: 'Đã xóa Photographer thành công' });
    }

    // -------------------------------------------------------------
    // SALES STAFF API (CRUD - Quản lý nhân sự & Hoa hồng Sales)
    // -------------------------------------------------------------

    // GET /api/sales-staff
    if (pathname === '/api/sales-staff' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM sales_staff ORDER BY name ASC').all();
      return sendJson(res, 200, { success: true, data: rows.map(mapDbRowToSalesStaff) });
    }

    // POST /api/sales-staff
    if (pathname === '/api/sales-staff' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const newId = body.id || `sales-${Date.now()}`;
      const name = (body.name || 'Sales Mới').trim();
      const phone = (body.phone || '').trim();
      const email = (body.email || '').trim();
      const roleTitle = body.roleTitle || 'Chuyên viên Sales Tư Vấn';
      const commType = body.commissionType || 'percentage';
      const commRate = Number(body.commissionRate) || 0;
      const commFixed = Number(body.commissionFixedAmount) || 0;
      const status = body.status || 'active';
      const username = (body.username || '').trim();
      const password = (body.password || '').trim();
      const canLogin = body.canLogin !== false ? 1 : 0;
      const avatar = body.avatar || '';
      const activeRegionsJson = JSON.stringify(Array.isArray(body.activeRegions) ? body.activeRegions : ['Hải Phòng']);
      const leaderId = (body.leaderId || '').trim();
      const leaderName = (body.leaderName || '').trim();

      const stmt = db.prepare(`
        INSERT INTO sales_staff (
          id, name, phone, email, role_title, commission_type, commission_rate,
          commission_fixed_amount, status, username, password, can_login, avatar,
          active_regions_json, leader_id, leader_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        newId, name, phone, email, roleTitle, commType, commRate,
        commFixed, status, username, password, canLogin, avatar, activeRegionsJson,
        leaderId, leaderName
      );

      const created = db.prepare('SELECT * FROM sales_staff WHERE id = ?').get(newId);
      logAudit({
        userId: currentUserId,
        userName: currentUserName,
        action: 'CREATE_SALES_STAFF',
        tableName: 'sales_staff',
        recordId: newId,
        newData: mapDbRowToSalesStaff(created),
        ipAddress: req.socket.remoteAddress
      });

      return sendJson(res, 201, { success: true, data: mapDbRowToSalesStaff(created) });
    }

    // PUT /api/sales-staff/:id
    if (pathname.startsWith('/api/sales-staff/') && req.method === 'PUT') {
      const staffId = decodeURIComponent(pathname.replace('/api/sales-staff/', ''));
      const existing = db.prepare('SELECT * FROM sales_staff WHERE id = ?').get(staffId);
      if (!existing) {
        return sendJson(res, 404, { success: false, error: 'Không tìm thấy Sales Staff' });
      }

      const body = await readJsonBody(req);
      const name = (body.name !== undefined ? body.name : existing.name).trim();
      const phone = body.phone !== undefined ? body.phone.trim() : existing.phone;
      const email = body.email !== undefined ? body.email.trim() : existing.email;
      const roleTitle = body.roleTitle !== undefined ? body.roleTitle : existing.role_title;
      const commType = body.commissionType !== undefined ? body.commissionType : existing.commission_type;
      const commRate = body.commissionRate !== undefined ? Number(body.commissionRate) : existing.commission_rate;
      const commFixed = body.commissionFixedAmount !== undefined ? Number(body.commissionFixedAmount) : existing.commission_fixed_amount;
      const status = body.status !== undefined ? body.status : existing.status;
      const username = body.username !== undefined ? body.username.trim() : existing.username;
      const password = body.password !== undefined ? body.password.trim() : existing.password;
      const canLogin = body.canLogin !== undefined ? (body.canLogin ? 1 : 0) : existing.can_login;
      const avatar = body.avatar !== undefined ? body.avatar : existing.avatar;
      const activeRegionsJson = body.activeRegions !== undefined ? JSON.stringify(body.activeRegions) : existing.active_regions_json;
      const leaderId = body.leaderId !== undefined ? (body.leaderId || '').trim() : (existing.leader_id || '');
      const leaderName = body.leaderName !== undefined ? (body.leaderName || '').trim() : (existing.leader_name || '');

      const stmt = db.prepare(`
        UPDATE sales_staff
        SET
          name = ?,
          phone = ?,
          email = ?,
          role_title = ?,
          commission_type = ?,
          commission_rate = ?,
          commission_fixed_amount = ?,
          status = ?,
          username = ?,
          password = ?,
          can_login = ?,
          avatar = ?,
          active_regions_json = ?,
          leader_id = ?,
          leader_name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        name, phone, email, roleTitle, commType, commRate,
        commFixed, status, username, password, canLogin, avatar, activeRegionsJson,
        leaderId, leaderName,
        staffId
      );

      const updated = db.prepare('SELECT * FROM sales_staff WHERE id = ?').get(staffId);
      logAudit({
        userId: currentUserId,
        userName: currentUserName,
        action: 'UPDATE_SALES_STAFF',
        tableName: 'sales_staff',
        recordId: staffId,
        oldData: mapDbRowToSalesStaff(existing),
        newData: mapDbRowToSalesStaff(updated),
        ipAddress: req.socket.remoteAddress
      });

      return sendJson(res, 200, { success: true, data: mapDbRowToSalesStaff(updated) });
    }

    // DELETE /api/sales-staff/:id
    if (pathname.startsWith('/api/sales-staff/') && req.method === 'DELETE') {
      const staffId = decodeURIComponent(pathname.replace('/api/sales-staff/', ''));
      const existing = db.prepare('SELECT * FROM sales_staff WHERE id = ?').get(staffId);
      if (!existing) {
        return sendJson(res, 404, { success: false, error: 'Không tìm thấy Sales Staff' });
      }

      db.prepare('DELETE FROM sales_staff WHERE id = ?').run(staffId);
      logAudit({
        userId: currentUserId,
        userName: currentUserName,
        action: 'DELETE_SALES_STAFF',
        tableName: 'sales_staff',
        recordId: staffId,
        oldData: mapDbRowToSalesStaff(existing),
        ipAddress: req.socket.remoteAddress
      });

      return sendJson(res, 200, { success: true, message: 'Đã xóa Sales Staff thành công' });
    }

    // -------------------------------------------------------------
    // NOTIFICATIONS API (Đồng bộ thông báo bền vững đa thiết bị & iOS)
    // -------------------------------------------------------------

    // GET /api/notifications - Lấy danh sách thông báo theo tài khoản
    if (pathname === '/api/notifications' && req.method === 'GET') {
      const targetUserId = searchParams.get('userId') || '';
      const targetRole = searchParams.get('role') || '';

      let rows = [];
      if (targetRole === 'admin' || (!targetUserId && !targetRole)) {
        rows = db.prepare(`
          SELECT * FROM notifications 
          ORDER BY created_at DESC 
          LIMIT 100
        `).all();
      } else {
        rows = db.prepare(`
          SELECT * FROM notifications 
          WHERE target_user_id = ? 
             OR target_role = ? 
             OR target_role = 'all'
          ORDER BY created_at DESC 
          LIMIT 100
        `).all(targetUserId, targetRole);
      }

      return sendJson(res, 200, { success: true, data: rows.map(mapDbRowToNotification) });
    }

    // POST /api/notifications - Tạo mới thông báo trên Server
    if (pathname === '/api/notifications' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const newId = body.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const type = body.type || 'system';
      const title = (body.title || 'Thông báo mới').trim();
      const message = (body.message || '').trim();
      const bookingId = body.bookingId || null;
      const customerId = body.customerId || null;
      const targetUserId = body.targetUserId || null;
      const targetRole = body.targetRole || null;
      const severity = body.severity || 'info';
      const timestamp = body.timestamp || new Date().toISOString();
      const read = body.read ? 1 : 0;
      const metadataJson = body.metadata ? JSON.stringify(body.metadata) : null;

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO notifications (
          id, type, title, message, booking_id, customer_id, target_user_id,
          target_role, severity, timestamp, read, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        newId, type, title, message, bookingId, customerId, targetUserId,
        targetRole, severity, timestamp, read, metadataJson
      );

      const created = db.prepare('SELECT * FROM notifications WHERE id = ?').get(newId);
      return sendJson(res, 201, { success: true, data: mapDbRowToNotification(created) });
    }

    // PUT /api/notifications/:id/read - Đánh dấu đã đọc 1 thông báo
    if (pathname.startsWith('/api/notifications/') && pathname.endsWith('/read') && req.method === 'PUT') {
      const notifId = pathname.replace('/api/notifications/', '').replace('/read', '').trim();
      db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(notifId);
      return sendJson(res, 200, { success: true, message: 'Đã đánh dấu đã đọc' });
    }

    // PUT /api/notifications/read-all - Đánh dấu đã đọc tất cả thông báo của user
    if (pathname === '/api/notifications/read-all' && req.method === 'PUT') {
      const body = await readJsonBody(req);
      const targetUserId = body.userId || searchParams.get('userId') || '';
      const targetRole = body.role || searchParams.get('role') || '';

      if (targetRole === 'admin') {
        db.prepare('UPDATE notifications SET read = 1').run();
      } else if (targetUserId) {
        db.prepare('UPDATE notifications SET read = 1 WHERE target_user_id = ? OR target_role = ? OR target_role = "all"').run(targetUserId, targetRole);
      }
      return sendJson(res, 200, { success: true, message: 'Đã đánh dấu đã đọc tất cả' });
    }

    // DELETE /api/notifications - Xóa thông báo của user
    if (pathname === '/api/notifications' && req.method === 'DELETE') {
      const targetUserId = searchParams.get('userId') || '';
      const targetRole = searchParams.get('role') || '';

      if (targetRole === 'admin') {
        db.prepare('DELETE FROM notifications').run();
      } else if (targetUserId) {
        db.prepare('DELETE FROM notifications WHERE target_user_id = ?').run(targetUserId);
      }
      return sendJson(res, 200, { success: true, message: 'Đã xóa thông báo' });
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
