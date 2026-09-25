import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Customer, Photographer, SalesStaff } from '../types';

/**
 * Service giao tiếp giữa CRM Xoắn Media và Supabase PostgreSQL
 * Tự động chuyển đổi giữa Real Database & Local/Mock Data
 */

export const crmSupabaseService = {
  // 1. KHÁCH HÀNG / LEADS (Bảng customers)
  async getCustomers(): Promise<Customer[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] Lỗi tải danh sách khách hàng:', error.message);
        return null;
      }

      return data?.map((row: any): Customer => ({
        id: row.id,
        name: row.name || 'Khách hàng',
        phone: row.phone || '',
        zalo: row.zalo || row.phone,
        email: row.email,
        facebook: row.facebook,
        tiktok: row.tiktok,
        schoolId: row.school_id,
        schoolName: row.school_name || row.school || 'THPT',
        grade: row.grade || 'Khối 12',
        className: row.class_name || row.className || '12A',
        academicYear: row.academic_year || '2025-2026',
        region: row.region || 'Hải Phòng',
        city: row.city || 'Hải Phòng',
        district: row.district || '',
        representativeRole: row.representative_role || 'Lớp trưởng',
        studentCount: Number(row.student_count || row.studentCount || 35),
        serviceType: row.service_type || 'Kỷ yếu Concept',
        servicePackageId: row.service_package_id,
        servicePackageName: row.service_package_name,
        concept: row.concept || 'Thanh xuân vườn trường',
        expectedShootDate: row.expected_shoot_date,
        shootingLocations: row.shooting_locations || ['Trường học'],
        expectedBudget: Number(row.expected_budget || 0),
        specialRequests: row.special_requests,
        notes: row.notes || '',
        source: row.source || 'Facebook',
        campaignName: row.campaign_name,
        pipelineStage: row.pipeline_stage || 'Chưa liên hệ',
        assignedSalesId: row.assigned_sales_id || 'user-2',
        assignedSalesName: row.assigned_sales_name || 'Lê Hoàng Sơn (Sales Lead)',
        assignedCareStaffId: row.assigned_care_staff_id,
        assignedCareStaffName: row.assigned_care_staff_name,
        totalRevenue: Number(row.total_revenue || 0),
        paidAmount: Number(row.paid_amount || 0),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
        lastContactedAt: row.last_contacted_at
      })) || [];
    } catch (err) {
      console.error('[Supabase] Exception getCustomers:', err);
      return null;
    }
  },

  async saveCustomer(customer: Customer): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const payload = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        zalo: customer.zalo || customer.phone,
        email: customer.email,
        school_id: customer.schoolId,
        school_name: customer.schoolName,
        grade: customer.grade,
        class_name: customer.className,
        academic_year: customer.academicYear,
        region: customer.region,
        representative_role: customer.representativeRole,
        student_count: customer.studentCount,
        service_type: customer.serviceType,
        service_package_id: customer.servicePackageId,
        service_package_name: customer.servicePackageName,
        concept: customer.concept,
        expected_shoot_date: customer.expectedShootDate,
        shooting_locations: customer.shootingLocations,
        expected_budget: customer.expectedBudget,
        notes: customer.notes,
        source: customer.source,
        pipeline_stage: customer.pipelineStage,
        assigned_sales_id: customer.assignedSalesId,
        assigned_sales_name: customer.assignedSalesName,
        total_revenue: customer.totalRevenue,
        paid_amount: customer.paidAmount,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('customers')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] Lỗi lưu khách hàng:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Supabase] Exception saveCustomer:', err);
      return false;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('[Supabase] Lỗi xóa khách hàng:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Supabase] Exception deleteCustomer:', err);
      return false;
    }
  },

  // 2. NHÂN SỰ SALES (Bảng sales_staff)
  async getSalesStaff(): Promise<SalesStaff[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('sales_staff')
        .select('*')
        .order('name');

      if (error) return null;

      return data?.map((row: any): SalesStaff => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        avatar: row.avatar,
        roleTitle: row.role_title || row.roleTitle || 'Chuyên viên Sales',
        activeRegions: row.active_regions || ['Hải Phòng'],
        status: row.status || 'active',
        canLogin: row.can_login ?? true,
        username: row.username,
        password: row.password,
        commissionType: row.commission_type || 'percentage',
        commissionRate: Number(row.commission_rate ?? 8),
        commissionFixedAmount: Number(row.commission_fixed_amount ?? 500000)
      })) || [];
    } catch {
      return null;
    }
  },

  // 3. ĐỘI NGŨ THỢ CHỤP (Bảng photographers)
  async getPhotographers(): Promise<Photographer[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .order('name');

      if (error) return null;

      return data?.map((row: any): Photographer => ({
        id: row.id,
        fullName: row.full_name || row.fullName || row.name || 'Thợ chụp',
        phone: row.phone || '',
        email: row.email || '',
        avatar: row.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        activeRegions: row.active_regions || ['Hải Phòng'],
        photographerType: row.photographer_type || 'Full-time',
        experienceYears: Number(row.experience_years ?? 3),
        skills: row.skills || ['Chụp chính'],
        equipmentList: row.equipment_list || ['Sony A7IV'],
        status: row.status || 'available',
        ratePerShoot: Number(row.rate_per_shoot ?? 800000),
        rating: Number(row.rating ?? 5.0),
        completedShootsCount: Number(row.completed_shoots_count ?? 0),
        notes: row.notes,
        username: row.username,
        password: row.password,
        canLogin: row.can_login ?? true
      })) || [];
    } catch {
      return null;
    }
  }
};
