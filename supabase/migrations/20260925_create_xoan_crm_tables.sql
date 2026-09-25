-- =========================================================================
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
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-1', 'Doanh', '0866957128', 'doanh.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Full-time', 4, ARRAY['Chụp chính'], ARRAY['Sony A7IV','Lens 24-70 GM II','Flash Godox V860III'], 'available', 1000000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (LEAD - HẢI PHÒNG)', 'doanh.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-2', 'Thành To', '0379552990', 'thanhto.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Full-time', 4, ARRAY['Chụp chính'], ARRAY['Sony A7IV','Lens 24-70 GM II','Flash Godox V860III'], 'available', 1000000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (LEAD - HÀ NỘI)', 'thanhto.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-3', 'Thắng', '0904487526', 'thang.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Full-time', 4, ARRAY['Chụp chính'], ARRAY['Sony A7IV','Lens 24-70 GM II','Flash Godox V860III'], 'available', 1000000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (LEAD - HẢI PHÒNG)', 'thang.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-4', 'Thành Con', '0358039115', 'thanhcon.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Full-time', 4, ARRAY['Chụp chính'], ARRAY['Sony A7IV','Lens 24-70 GM II','Flash Godox V860III'], 'available', 1000000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (LEAD - HÀ NỘI)', 'thanhcon.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-5', 'Văn', '0869526853', 'van.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Full-time', 4, ARRAY['Chụp chính'], ARRAY['Sony A7IV','Lens 24-70 GM II','Flash Godox V860III'], 'available', 1000000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (LEAD - HÀ NỘI)', 'van.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-6', 'Thành An', '0985120016', 'thanhan.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Freelancer', 2, ARRAY['Quay phim'], ARRAY['Sony FX3 / A7SIII','Gimbal Ronin RS3','Mic Rode Wireless'], 'available', 1200000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (QUAY PHIM - HÀ NỘI)', 'thanhan.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-7', 'Thắng Quay Phim', '0367715204', 'thangquayphim.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Quay phim'], ARRAY['Sony FX3 / A7SIII','Gimbal Ronin RS3','Mic Rode Wireless'], 'available', 1200000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (QUAY PHIM - HẢI PHÒNG)', 'thangquayphim.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-8', 'Quang Nguyễn', '0974364661', 'quangnguyen.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Quay phim'], ARRAY['Sony FX3 / A7SIII','Gimbal Ronin RS3','Mic Rode Wireless'], 'available', 1200000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (QUAY PHIM - HẢI PHÒNG)', 'quangnguyen.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-9', 'Quách Văn Huyền', '0988874108', 'quachvanhuyen.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Full-time', 4, ARRAY['Chụp chính'], ARRAY['Sony A7IV','Lens 24-70 GM II','Flash Godox V860III'], 'available', 1000000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (LEAD - HÀ NỘI)', 'quachvanhuyen.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-10', 'Đức Trung', '0988874109', 'ductrung.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Full-time', 4, ARRAY['Chụp chính'], ARRAY['Sony A7IV','Lens 24-70 GM II','Flash Godox V860III'], 'available', 1000000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (LEAD - HÀ NỘI)', 'ductrung.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-11', 'Tú Voi', '0328108778', 'tuvoi.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HÀ NỘI)', 'tuvoi.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-12', 'Thuận Vũ', '0984458941', 'thuanvu.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HÀ NỘI)', 'thuanvu.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-13', 'Long', '0981108601', 'long.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HÀ NỘI)', 'long.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-14', 'Thái', '0345785671', 'thai.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HÀ NỘI)', 'thai.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-15', 'Lê Lâm Tùng', '0787312607', 'lelamtung.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'lelamtung.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-16', 'Dũng Đen', '0988874115', 'dungden.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', ARRAY['Hà Nội'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HÀ NỘI)', 'dungden.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-17', 'Hạo Nhiên', '0988874116', 'haonhien.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng','Hà Nội'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - KHÁC)', 'haonhien.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-18', 'Bin Hoàng', '0868710343', 'binhoang.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'binhoang.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-19', 'Phạm Hồng Quân', '0944879855', 'phamhongquan.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'phamhongquan.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-20', 'Doãn Hiểu', '0328727894', 'doanhieu.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'doanhieu.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-21', 'Phong Lê', '0975987565', 'phongle.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'phongle.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-22', 'Vũ Ngọc Tú', '0964458168', 'vungoctu.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'vungoctu.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-23', 'Nguyên Lê', '0988874122', 'nguyenle.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'nguyenle.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-24', 'Hổ Phách', '0989659634', 'hophach.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'hophach.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-25', 'Hoàng Xuân Nguyễn', '0345707698', 'hoangxuannguyen.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'hoangxuannguyen.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-26', 'Hoàng Vũ', '0975878459', 'hoangvu.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'hoangvu.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-27', 'Nguyễn Thế Hoàng', '0849368598', 'nguyenthehoang.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'nguyenthehoang.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-28', 'Kim Tiền', '0393866710', 'kimtien.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'kimtien.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-29', 'Phạm Chung', '0973458592', 'phamchung.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'phamchung.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-30', 'Phạm Tùng', '0775303040', 'phamtung.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'phamtung.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-31', 'Tuấn Vịt', '0386028883', 'tuanvit.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'tuanvit.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-32', 'Phạm Duy Thành', '0705403697', 'phamduythanh.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'phamduythanh.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-33', 'Nguyễn Đức Vượng', '0989413224', 'nguyenducvuong.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'nguyenducvuong.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-34', 'Minh Tiến', '0376511051', 'minhtien.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'minhtien.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-35', 'Hành Tây', '0988874134', 'hanhtay.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'hanhtay.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-36', 'Tuấn Thành', '0333640448', 'tuanthanh.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'tuanthanh.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-37', 'Trương Đức Mạnh', '0988874136', 'truongducmanh.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'truongducmanh.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;
INSERT INTO public.photographers (id, full_name, phone, email, avatar, active_regions, photographer_type, experience_years, skills, equipment_list, status, rate_per_shoot, rating, completed_shoots_count, notes, username, password, can_login)
VALUES ('photo-38', 'An Conan', '0777960967', 'anconan.photo@xoanmedia.vn', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', ARRAY['Hải Phòng'], 'Freelancer', 2, ARRAY['Chụp phụ'], ARRAY['Sony A7III','Lens 24-70mm','Flash Godox'], 'available', 600000, 5, 0, 'Thợ Ekip 2026 Xoắn Media (SP - HẢI PHÒNG)', 'anconan.photo@xoanmedia.vn', 'XoanPhoto@2026', true)
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    active_regions = EXCLUDED.active_regions,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password;

-- HOÀN TẤT SEEDING!