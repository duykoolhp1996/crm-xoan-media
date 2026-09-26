-- =========================================================================
-- DATABASE SCHEMA CHUYÊN BIỆT CHO XOĂN MEDIA CRM (KỶ YẾU & HỌC ĐƯỜNG)
-- Hỗ trợ: PostgreSQL 14+ / Supabase với RLS, UUID, Timestamps, Triggers
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & USERS
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'admin', 'manager', 'sales', 'marketing', 'photographer'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHOOLS & CLASSES
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    type VARCHAR(50) CHECK (type IN ('THCS', 'THPT', 'Đại học', 'Cao đẳng')),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    grade VARCHAR(50) NOT NULL, -- Khối 9, Khối 12, Năm 4
    class_name VARCHAR(100) NOT NULL, -- 12A1, K62 NEU
    academic_year VARCHAR(50) NOT NULL, -- 2024-2025
    student_count INT DEFAULT 0,
    representative_name VARCHAR(255),
    representative_phone VARCHAR(50),
    representative_facebook TEXT,
    representative_zalo VARCHAR(50),
    status VARCHAR(50) DEFAULT 'lead',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MARKETING SOURCES & CAMPAIGNS
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Facebook Ads', 'TikTok Ads', 'Website', 'Zalo', 'Referral'...
    category VARCHAR(50) -- 'Paid', 'Organic', 'Referral'
);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    budget NUMERIC(15,2) DEFAULT 0,
    spent NUMERIC(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Running',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICES & PACKAGES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15,2) NOT NULL,
    min_students INT DEFAULT 20,
    duration_hours INT DEFAULT 8,
    lead_photographers_needed INT DEFAULT 1,
    assistants_needed INT DEFAULT 1,
    makeup_included BOOLEAN DEFAULT FALSE,
    photo_count_total INT DEFAULT 500,
    photo_count_edited INT DEFAULT 60,
    video_included BOOLEAN DEFAULT FALSE,
    album_included BOOLEAN DEFAULT FALSE,
    extra_fees_note TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUSTOMERS & LEADS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    facebook_url TEXT,
    tiktok_account VARCHAR(100),
    zalo_phone VARCHAR(50),
    
    -- Quan hệ Trường / Lớp
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    grade VARCHAR(50),
    class_name VARCHAR(100),
    academic_year VARCHAR(50),
    region VARCHAR(100),
    representative_role VARCHAR(100),
    student_count INT DEFAULT 0,
    
    -- Nhu cầu & Concept
    service_type VARCHAR(100),
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    concept TEXT,
    expected_shoot_date DATE,
    shooting_locations TEXT[],
    expected_budget NUMERIC(15,2) DEFAULT 0,
    special_requests TEXT,
    notes TEXT,
    
    -- Nguồn Marketing & Attribution
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Trạng thái Pipeline 13 giai đoạn
    pipeline_stage VARCHAR(50) NOT NULL DEFAULT 'New Lead',
    assigned_sales_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_care_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    total_revenue NUMERIC(15,2) DEFAULT 0,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contacted_at TIMESTAMPTZ
);

-- 6. PHOTOGRAPHERS & SCHEDULES
CREATE TABLE IF NOT EXISTS photographers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    active_regions TEXT[],
    photographer_type VARCHAR(50) DEFAULT 'Freelancer', -- 'Full-time', 'Freelancer', 'Đối tác Studio'
    experience_years INT DEFAULT 1,
    skills TEXT[],
    equipment_list TEXT[],
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'offline', 'inactive'
    rate_per_shoot NUMERIC(15,2) DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.0,
    completed_shoots_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOOKINGS & ASSIGNMENTS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    shoot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    student_count INT DEFAULT 0,
    
    total_amount NUMERIC(15,2) DEFAULT 0,
    deposit_amount NUMERIC(15,2) DEFAULT 0,
    remaining_amount NUMERIC(15,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'Chưa cọc',
    booking_status VARCHAR(50) DEFAULT 'Chờ xác nhận',
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE RESTRICT,
    role_in_booking VARCHAR(50) NOT NULL, -- 'Lead', 'Assistant', 'Videographer', 'Makeup'
    assigned_fee NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photographer_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'busy',
    note TEXT
);

-- 8. REMARKETING CRM & WORKFLOWS
CREATE TABLE IF NOT EXISTS campaign_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_criteria JSONB,
    customer_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS remarketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(100),
    segment_id UUID REFERENCES campaign_segments(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL, -- 'Facebook', 'TikTok', 'Zalo', 'SMS', 'Phone'
    start_date DATE,
    end_date DATE,
    content TEXT,
    offer TEXT,
    budget NUMERIC(15,2) DEFAULT 0,
    spent NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS remarketing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES remarketing_campaigns(id) ON DELETE SET NULL,
    channel VARCHAR(50),
    status VARCHAR(50), -- 'sent', 'opened', 'clicked', 'converted'
    response_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TASKS & COMMUNICATIONS & AUDIT
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(50), -- 'Call', 'Zalo', 'Facebook', 'SMS', 'Email'
    direction VARCHAR(20) DEFAULT 'outbound',
    content TEXT,
    result VARCHAR(100),
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES CHO PERFORMANCE TỐI ĐA
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_school ON customers(school_id);
CREATE INDEX IF NOT EXISTS idx_customers_pipeline ON customers(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(shoot_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_photographers_status ON photographers(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
