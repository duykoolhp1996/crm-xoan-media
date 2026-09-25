const fs = require('fs');
const path = require('path');

const photographers = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/photographersData.json'), 'utf8'));

let sql = `-- =========================================================================
-- SUPABASE POSTGRESQL MIGRATION: CRM XOẮN MEDIA (KỶ YẾU & HỌC ĐƯỜNG 2026)
-- Project Ref: etvbrbdysphrfzvnwvbk
-- Tạo toàn bộ cấu trúc bảng lưu trữ & Seed dữ liệu thực tế
-- =========================================================================

-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG NHÂN SỰ SALES (sales_staff)
CREATE TABLE IF NOT EXISTS public.sales_staff (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar TEXT,
    role_title VARCHAR(100) DEFAULT 'Chuyên viên Sales',
    active_regions TEXT[] DEFAULT ARRAY['Hải Phòng'],
    status VARCHAR(50) DEFAULT 'active',
    can_login BOOLEAN DEFAULT TRUE,
    username VARCHAR(100),
    password VARCHAR(255),
    commission_type VARCHAR(50) DEFAULT 'percentage', -- 'percentage' hoặc 'fixed'
    commission_rate NUMERIC DEFAULT 8, -- Tỷ lệ % doanh thu
    commission_fixed_amount NUMERIC DEFAULT 500000, -- Số tiền cố định/hợp đồng
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG ĐỘI NGŨ THỢ CHỤP (photographers) - 38 Ekip
CREATE TABLE IF NOT EXISTS public.photographers (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    avatar TEXT,
    active_regions TEXT[] DEFAULT ARRAY['Hải Phòng'],
    photographer_type VARCHAR(50) DEFAULT 'Full-time', -- 'Full-time', 'Freelancer', 'Đối tác Studio'
    experience_years INT DEFAULT 3,
    skills TEXT[] DEFAULT ARRAY['Chụp chính'],
    equipment_list TEXT[] DEFAULT ARRAY['Sony A7IV'],
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'offline', 'inactive'
    rate_per_shoot NUMERIC DEFAULT 800000,
    rating NUMERIC DEFAULT 5.0,
    completed_shoots_count INT DEFAULT 0,
    notes TEXT,
    username VARCHAR(100),
    password VARCHAR(255),
    can_login BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG GÓI DỊCH VỤ KỶ YẾU (service_packages)
CREATE TABLE IF NOT EXISTS public.service_packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    min_students INT DEFAULT 30,
    duration_hours INT DEFAULT 4,
    lead_photographers_needed INT DEFAULT 1,
    assistants_needed INT DEFAULT 1,
    makeup_included BOOLEAN DEFAULT FALSE,
    photo_count_total INT DEFAULT 400,
    photo_count_edited INT DEFAULT 50,
    video_included BOOLEAN DEFAULT FALSE,
    album_included BOOLEAN DEFAULT FALSE,
    extra_fees_note TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG KHÁCH HÀNG / LỚP HỌC (customers - Trọng tâm Pipeline CRM)
CREATE TABLE IF NOT EXISTS public.customers (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    zalo VARCHAR(50),
    email VARCHAR(255),
    facebook TEXT,
    tiktok TEXT,
    school_id VARCHAR(50),
    school_name VARCHAR(255) NOT NULL,
    grade VARCHAR(50) DEFAULT 'Khối 12',
    class_name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(50) DEFAULT '2025-2026',
    region VARCHAR(100) DEFAULT 'Hải Phòng',
    city VARCHAR(100) DEFAULT 'Hải Phòng',
    district VARCHAR(100),
    representative_role VARCHAR(100) DEFAULT 'Lớp trưởng',
    student_count INT DEFAULT 35,
    service_type VARCHAR(100) DEFAULT 'Kỷ yếu Concept',
    service_package_id VARCHAR(50) REFERENCES public.service_packages(id) ON DELETE SET NULL,
    service_package_name VARCHAR(255),
    concept VARCHAR(255) DEFAULT 'Thanh xuân vườn trường',
    expected_shoot_date DATE,
    shooting_locations TEXT[] DEFAULT ARRAY['Trường học'],
    expected_budget NUMERIC DEFAULT 0,
    special_requests TEXT,
    notes TEXT,
    source VARCHAR(100) DEFAULT 'Facebook',
    campaign_name VARCHAR(255),
    pipeline_stage VARCHAR(100) DEFAULT 'New Lead',
    assigned_sales_id VARCHAR(50) REFERENCES public.sales_staff(id) ON DELETE SET NULL,
    assigned_sales_name VARCHAR(255),
    assigned_care_staff_id VARCHAR(50),
    assigned_care_staff_name VARCHAR(255),
    total_revenue NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG LỊCH CHỤP / BOOKINGS (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    customer_id VARCHAR(100) REFERENCES public.customers(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    shoot_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    locations TEXT[] DEFAULT ARRAY['Trường học'],
    service_package_name VARCHAR(255),
    lead_photographer_id VARCHAR(50) REFERENCES public.photographers(id) ON DELETE SET NULL,
    lead_photographer_name VARCHAR(255),
    assistant_photographer_ids TEXT[],
    videographer_ids TEXT[],
    status VARCHAR(50) DEFAULT 'Đã đặt cọc',
    total_amount NUMERIC DEFAULT 0,
    deposit_amount NUMERIC DEFAULT 0,
    remaining_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG PHIẾU THU / THANH TOÁN (payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id VARCHAR(100) PRIMARY KEY,
    customer_id VARCHAR(100) REFERENCES public.customers(id) ON DELETE CASCADE,
    booking_id VARCHAR(100) REFERENCES public.bookings(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Chuyển khoản', -- 'Tiền mặt', 'Chuyển khoản'
    payment_type VARCHAR(50) DEFAULT 'Đặt cọc', -- 'Đặt cọc', 'Đợt 2', 'Nghiệm thu'
    notes TEXT,
    received_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BẬT ROW LEVEL SECURITY (RLS) VÀ CẤP QUYỀN TRUY CẬP CHO APP
ALTER TABLE public.sales_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Cấp quyền SELECT, INSERT, UPDATE, DELETE cho role 'anon' và 'authenticated'
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access sales_staff" ON public.sales_staff;
    CREATE POLICY "Public access sales_staff" ON public.sales_staff FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access photographers" ON public.photographers;
    CREATE POLICY "Public access photographers" ON public.photographers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access service_packages" ON public.service_packages;
    CREATE POLICY "Public access service_packages" ON public.service_packages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access customers" ON public.customers;
    CREATE POLICY "Public access customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access bookings" ON public.bookings;
    CREATE POLICY "Public access bookings" ON public.bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access payments" ON public.payments;
    CREATE POLICY "Public access payments" ON public.payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =========================================================================
-- SEED DATA THỰC TẾ XOẮN MEDIA 2026
-- =========================================================================

-- A. SEED 4 SALES CHÍNH THỨC (Kèm chính sách % hoa hồng & chia cố định)
INSERT INTO public.sales_staff (id, name, email, phone, avatar, role_title, active_regions, status, can_login, username, password, commission_type, commission_rate, commission_fixed_amount)
VALUES 
('user-2', 'Lê Hoàng Sơn (Sales Lead)', 'son.lh@xoanmedia.vn', '0912345678', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Trưởng Nhóm Sales', ARRAY['Hải Phòng', 'Hà Nội'], 'active', true, 'son.lh@xoanmedia.vn', 'SonLead@2024', 'percentage', 10, 500000),
('user-sales-1', 'Nguyễn Thu Hương (Sales)', 'huong.nt@xoanmedia.vn', '0987654321', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Chuyên viên Sales', ARRAY['Hải Phòng', 'Hà Nội'], 'active', true, 'huong.nt@xoanmedia.vn', 'HuongSales@2024', 'percentage', 8, 500000),
('user-sales-2', 'Trần Hải Đăng (Sales)', 'dang.th@xoanmedia.vn', '0966554433', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'Chuyên viên Sales', ARRAY['Hải Phòng', 'Thái Bình', 'Nam Định'], 'active', true, 'dang.th@xoanmedia.vn', 'DangSales@2024', 'fixed', 8, 600000),
('user-sales-3', 'Vũ Mai Phương (CTV Sales)', 'phuong.vm@xoanmedia.vn', '0911223344', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'CTV Sales', ARRAY['Hải Phòng'], 'active', true, 'phuong.vm@xoanmedia.vn', 'PhuongCTV@2024', 'fixed', 8, 500000)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    role_title = EXCLUDED.role_title,
    commission_type = EXCLUDED.commission_type,
    commission_rate = EXCLUDED.commission_rate,
    commission_fixed_amount = EXCLUDED.commission_fixed_amount;

-- B. SEED 4 GÓI DỊCH VỤ KỶ YẾU CHUẨN
INSERT INTO public.service_packages (id, name, description, price, min_students, duration_hours, lead_photographers_needed, assistants_needed, makeup_included, photo_count_total, photo_count_edited, video_included, album_included, extra_fees_note, status)
VALUES
('pkg-1', 'Gói Kỷ Yếu BASIC (Tiết Kiệm)', 'Chụp tại trường 1 buổi, bao gồm cử nhân, áo dài, chụp tập thể và chụp đơn cho từng thành viên.', 3500000, 30, 4, 1, 1, false, 400, 50, false, false, 'Thêm thợ phụ: 500k/buổi. Thuê flycam: 800k.', 'active'),
('pkg-2', 'Gói Kỷ Yếu STANDARD (Bán Chạy Nhất)', 'Chụp cả ngày (Sáng tại trường + Chiều tại Hoàng Thành / Văn Miếu). Tặng trang phục cử nhân + áo cử nhân + vòng hoa đội đầu.', 6800000, 35, 8, 2, 1, true, 1000, 100, false, false, 'Đã bao gồm chi phí vé vào cổng di tích cho ekip.', 'active'),
('pkg-3', 'Gói Kỷ Yếu PREMIUM CONCEPT & DẠ TIỆC', 'Chụp trường + Phim trường ngoại cảnh + Party Night (bột màu, pháo sáng, lửa trại). Bao gồm quay Video Highlight 4K + Flycam.', 12500000, 40, 12, 2, 2, true, 2500, 200, true, true, 'Trọn gói trang phục concept Retro, Cổ phục hoặc Harry Potter theo lựa chọn của lớp.', 'active'),
('pkg-4', 'Gói Kỷ Yếu VIP - CINEMATIC MEMORY', 'Gói cao cấp nhất dành cho khối đại học và lớp chọn: 3 thợ chụp, 2 thợ quay flycam + gimbal, toàn bộ trang phục dạ tiệc & make up cao cấp.', 18900000, 40, 14, 3, 2, true, 4000, 350, true, true, 'Tặng 01 Photobook cao cấp ép lụa 50 trang cho lớp & 01 bản tin phỏng vấn lưu bút.', 'active')
ON CONFLICT (id) DO NOTHING;

-- C. SEED 38 THỢ CHỤP THỰC TẾ NĂM 2026 TỪ GOOGLE SHEET
`;

photographers.forEach(p => {
    const id = p.id;
    const fullName = p.fullName.replace(/'/g, "''");
    const phone = p.phone || '';
    const email = (p.email || `${id}@xoanmedia.vn`).replace(/'/g, "''");
    const avatar = (p.avatar || '').replace(/'/g, "''");
    const regions = "ARRAY[" + (p.activeRegions || ['Hải Phòng']).map(r => `'${r.replace(/'/g, "''")}'`).join(',') + "]";
    const photoType = p.photographerType || 'Full-time';
    const exp = p.experienceYears || 3;
    const skills = "ARRAY[" + (p.skills || ['Chụp chính']).map(s => `'${s.replace(/'/g, "''")}'`).join(',') + "]";
    const equips = "ARRAY[" + (p.equipmentList || ['Sony A7IV']).map(e => `'${e.replace(/'/g, "''")}'`).join(',') + "]";
    const status = p.status || 'available';
    const rate = p.ratePerShoot || 800000;
    const rating = p.rating || 5.0;
    const shoots = p.completedShootsCount || 0;
    const notes = (p.notes || '').replace(/'/g, "''");
    const username = (p.username || email).replace(/'/g, "''");
    const password = (p.password || 'XoanPhoto@2026').replace(/'/g, "''");
    const canLogin = p.canLogin !== false;

    sql += `INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('${id}', '${fullName}', '${phone}', '${email}', '${avatar}', ${regions}, '${photoType}', ${exp}, ${skills}, ${equips}, '${status}', ${rate}, ${rating}, ${shoots}, '${notes}', '${username}', '${password}', ${canLogin})
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
`;
});

sql += `\n-- HOÀN TẤT SEEDING!`;

fs.writeFileSync(path.join(__dirname, '../supabase/migrations/20260925_create_xoan_crm_tables.sql'), sql, 'utf8');
console.log('Successfully generated SQL file!');
