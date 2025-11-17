-- ============================================
-- Beauty CRM - Improved Database Schema
-- ============================================
-- Architecture: Single Table with Discriminator
-- Multi-tenancy: Shop-based isolation with RLS
-- Auth: Supabase Auth with multi-provider support
-- Service Menu: Hierarchical structure with flexible pricing
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User type discriminator
CREATE TYPE user_type AS ENUM ('ADMIN_USER', 'CUSTOMER');

-- User roles (System-level permissions)
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',    -- Platform owner (manages all shops)
  'ADMIN',          -- Shop owner (default on signup)
  'MANAGER',        -- Shop manager
  'STAFF',          -- General staff
  'DESIGNER',       -- Designer/stylist
  'CUSTOMER'        -- Customer
);

-- Auth provider types
CREATE TYPE auth_provider AS ENUM (
  'EMAIL',          -- Email/password
  'LINE',           -- LINE login
  'GOOGLE',         -- Google OAuth
  'KAKAO'           -- Kakao login
);

-- Business types
CREATE TYPE business_type AS ENUM (
  'HAIR_SALON',
  'NAIL_SALON',
  'SKIN_CARE',
  'MAKEUP',
  'SPA',
  'MASSAGE',
  'EYELASH',
  'WAXING',
  'OTHER'
);

-- Booking status
CREATE TYPE booking_status AS ENUM (
  'PENDING',        -- 예약 대기
  'CONFIRMED',      -- 예약 확정
  'IN_PROGRESS',    -- 시술 중
  'COMPLETED',      -- 완료
  'CANCELLED',      -- 취소
  'NO_SHOW'         -- 노쇼
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PAID',
  'REFUNDED',
  'FAILED'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (unified for both admin users and customers)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Discriminator
  user_type user_type NOT NULL,
  role user_role NOT NULL DEFAULT 'ADMIN',

  -- Basic info
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  profile_image TEXT,

  -- Auth info
  auth_provider auth_provider NOT NULL DEFAULT 'EMAIL',
  provider_user_id TEXT, -- ID from social provider (LINE, Google, etc.)

  -- Shop association (NULL for SUPER_ADMIN, required for others)
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,

  -- Hierarchy tracking
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Approval workflow (for admin users)
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_user_type_role CHECK (
    (user_type = 'ADMIN_USER' AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'DESIGNER')) OR
    (user_type = 'CUSTOMER' AND role = 'CUSTOMER')
  ),
  CONSTRAINT super_admin_no_shop CHECK (
    (role = 'SUPER_ADMIN' AND shop_id IS NULL) OR
    (role != 'SUPER_ADMIN')
  )
);

-- Shops table
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name TEXT NOT NULL,
  business_type business_type NOT NULL,
  description TEXT,

  -- Contact
  phone TEXT NOT NULL,
  email TEXT,

  -- Address
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'TH',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Business hours (JSONB for flexibility)
  business_hours JSONB DEFAULT '{
    "monday": {"enabled": true, "open": "09:00", "close": "18:00"},
    "tuesday": {"enabled": true, "open": "09:00", "close": "18:00"},
    "wednesday": {"enabled": true, "open": "09:00", "close": "18:00"},
    "thursday": {"enabled": true, "open": "09:00", "close": "18:00"},
    "friday": {"enabled": true, "open": "09:00", "close": "18:00"},
    "saturday": {"enabled": true, "open": "09:00", "close": "18:00"},
    "sunday": {"enabled": false, "open": null, "close": null}
  }'::jsonb,

  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  images TEXT[] DEFAULT '{}',

  -- Settings
  settings JSONB DEFAULT '{
    "booking_advance_days": 30,
    "booking_cancellation_hours": 24,
    "slot_duration_minutes": 30,
    "currency": "THB",
    "timezone": "Asia/Bangkok"
  }'::jsonb,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Staff positions (customizable per shop)
CREATE TABLE staff_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Position info
  name TEXT NOT NULL,           -- "디렉터", "스페셜 디렉터", "주니어"
  name_en TEXT,
  name_th TEXT,
  description TEXT,

  -- Hierarchy level (used for service pricing)
  level INTEGER NOT NULL DEFAULT 1,  -- 1=junior, 2=mid, 3=senior, etc.

  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(shop_id, name)
);

-- Admin profiles (additional info for admin users)
CREATE TABLE admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Position (customizable by shop)
  position_id UUID REFERENCES staff_positions(id) ON DELETE SET NULL,

  -- Custom permissions (JSONB for flexibility)
  permissions JSONB NOT NULL DEFAULT '{
    "bookings": {"view": true, "create": true, "edit": true, "delete": false},
    "customers": {"view": true, "create": true, "edit": true, "delete": false},
    "services": {"view": true, "create": false, "edit": false, "delete": false},
    "staff": {"view": true, "create": false, "edit": false, "delete": false},
    "settings": {"view": false, "edit": false}
  }'::jsonb,

  -- Work schedule (JSONB for flexible schedule management)
  work_schedule JSONB DEFAULT '{
    "monday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "thursday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "friday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "saturday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "sunday": {"enabled": false, "start": null, "end": null}
  }'::jsonb,

  -- Additional info
  bio TEXT,
  specialties TEXT[],
  years_of_experience INTEGER,

  -- Social media links
  social_links JSONB DEFAULT '{
    "instagram": null,
    "tiktok": null,
    "youtube": null,
    "facebook": null,
    "twitter": null,
    "website": null
  }'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT admin_user_only CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = user_id AND user_type = 'ADMIN_USER')
  )
);

-- Customer profiles (additional info for customers)
CREATE TABLE customer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- LINE integration
  line_user_id TEXT UNIQUE,
  line_display_name TEXT,
  line_picture_url TEXT,
  line_status_message TEXT,

  -- Customer preferences
  preferred_shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  preferred_designer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  preferences JSONB DEFAULT '{}'::jsonb, -- Styling preferences, allergies, etc.

  -- Customer stats
  total_bookings INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_visit_at TIMESTAMP WITH TIME ZONE,

  -- Marketing
  marketing_consent BOOLEAN NOT NULL DEFAULT false,

  -- Notes (visible to staff)
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT customer_user_only CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = user_id AND user_type = 'CUSTOMER')
  )
);

-- Service categories (for organizing services)
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Category info
  name TEXT NOT NULL,           -- "CUT", "PERM", "COLOR", "CLINIC"
  name_en TEXT,
  name_th TEXT,
  description TEXT,

  -- Display
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(shop_id, name)
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,

  -- Service info
  name TEXT NOT NULL,
  name_en TEXT,
  name_th TEXT,
  description TEXT,

  -- Pricing type
  pricing_type TEXT NOT NULL DEFAULT 'POSITION_BASED',  -- 'FIXED' | 'POSITION_BASED'

  -- Price (used only when pricing_type='FIXED')
  base_price DECIMAL(10, 2),

  -- Duration
  duration_minutes INTEGER NOT NULL,

  -- Media
  image_url TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_pricing_type CHECK (pricing_type IN ('FIXED', 'POSITION_BASED')),
  CONSTRAINT fixed_price_required CHECK (
    (pricing_type = 'FIXED' AND base_price IS NOT NULL) OR
    (pricing_type = 'POSITION_BASED')
  )
);

-- Service pricing by position (position-based pricing)
CREATE TABLE service_position_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES staff_positions(id) ON DELETE CASCADE,

  -- Price for this position level
  price DECIMAL(10, 2) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(service_id, position_id),

  -- Ensure this is only used for POSITION_BASED services
  CONSTRAINT position_based_only CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_id AND pricing_type = 'POSITION_BASED'
    )
  )
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,

  -- Booking details
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,

  -- Status
  status booking_status NOT NULL DEFAULT 'PENDING',

  -- Pricing
  service_price DECIMAL(10, 2) NOT NULL,
  additional_charges DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,

  -- Payment
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Notes
  customer_notes TEXT,
  staff_notes TEXT,

  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- LINE notification
  line_notification_sent BOOLEAN NOT NULL DEFAULT false,
  line_notification_sent_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_total CHECK (total_price >= 0),
  CONSTRAINT customer_role_check CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = customer_id AND user_type = 'CUSTOMER')
  ),
  CONSTRAINT designer_role_check CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = designer_id AND user_type = 'ADMIN_USER')
  )
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Rating (1-5)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Review content
  comment TEXT,

  -- Media
  images TEXT[] DEFAULT '{}',

  -- Response from shop
  response TEXT,
  response_by UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP WITH TIME ZONE,

  -- Status
  is_visible BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_shop_id ON users(shop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_user_type ON users(user_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_by ON users(created_by);
CREATE INDEX idx_users_provider ON users(auth_provider, provider_user_id);
CREATE INDEX idx_users_approval ON users(is_approved, user_type) WHERE user_type = 'ADMIN_USER';

-- Customer profiles indexes
CREATE INDEX idx_customer_profiles_line ON customer_profiles(line_user_id);
CREATE INDEX idx_customer_profiles_shop ON customer_profiles(preferred_shop_id);

-- Shops indexes
CREATE INDEX idx_shops_business_type ON shops(business_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_shops_active ON shops(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_shops_location ON shops(latitude, longitude) WHERE deleted_at IS NULL;

-- Staff positions indexes
CREATE INDEX idx_staff_positions_shop ON staff_positions(shop_id) WHERE is_active = true;
CREATE INDEX idx_staff_positions_level ON staff_positions(shop_id, level);

-- Admin profiles indexes
CREATE INDEX idx_admin_profiles_position ON admin_profiles(position_id);

-- Service categories indexes
CREATE INDEX idx_service_categories_shop ON service_categories(shop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_service_categories_active ON service_categories(is_active, shop_id) WHERE deleted_at IS NULL;

-- Services indexes
CREATE INDEX idx_services_shop ON services(shop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_category ON services(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_active ON services(is_active, shop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_pricing_type ON services(pricing_type);

-- Service position prices indexes
CREATE INDEX idx_service_position_prices_service ON service_position_prices(service_id);
CREATE INDEX idx_service_position_prices_position ON service_position_prices(position_id);

-- Bookings indexes
CREATE INDEX idx_bookings_shop ON bookings(shop_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_designer ON bookings(designer_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_designer_date ON bookings(designer_id, booking_date, start_time);

-- Reviews indexes
CREATE INDEX idx_reviews_shop ON reviews(shop_id) WHERE is_visible = true;
CREATE INDEX idx_reviews_designer ON reviews(designer_id) WHERE is_visible = true;
CREATE INDEX idx_reviews_customer ON reviews(customer_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_staff_positions_updated_at BEFORE UPDATE ON staff_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_position_prices_updated_at BEFORE UPDATE ON service_position_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user in users table when auth.users is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, user_type, role, email, name, auth_provider, provider_user_id, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'CUSTOMER')::user_type,
    COALESCE(NEW.raw_user_meta_data->>'role',
      CASE
        WHEN COALESCE(NEW.raw_user_meta_data->>'user_type', 'CUSTOMER') = 'ADMIN_USER' THEN 'ADMIN'
        ELSE 'CUSTOMER'
      END
    )::user_role,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'auth_provider', 'EMAIL')::auth_provider,
    NEW.raw_user_meta_data->>'provider_user_id',
    -- Auto-approve customers, admin users need approval
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'user_type', 'CUSTOMER') = 'CUSTOMER' THEN true
      ELSE false
    END
  );

  -- Create profile based on user type
  IF (COALESCE(NEW.raw_user_meta_data->>'user_type', 'CUSTOMER') = 'CUSTOMER') THEN
    INSERT INTO customer_profiles (user_id, line_user_id, line_display_name, line_picture_url)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'line_user_id',
      NEW.raw_user_meta_data->>'line_display_name',
      NEW.raw_user_meta_data->>'line_picture_url'
    );
  ELSIF (NEW.raw_user_meta_data->>'user_type' = 'ADMIN_USER') THEN
    INSERT INTO admin_profiles (user_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update customer stats on booking completion
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    UPDATE customer_profiles
    SET
      total_bookings = total_bookings + 1,
      total_spent = total_spent + NEW.total_price,
      last_visit_at = NOW()
    WHERE user_id = NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_stats_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_position_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Users can view same shop users"
  ON users FOR SELECT
  USING (
    shop_id IN (
      SELECT shop_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can create users in their shop"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'ADMIN_USER'
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
      AND (shop_id = NEW.shop_id OR role = 'SUPER_ADMIN')
    )
  );

-- Shops policies
CREATE POLICY "Anyone can view active shops"
  ON shops FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Super admins can manage all shops"
  ON shops FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Admins can update their own shop"
  ON shops FOR UPDATE
  USING (
    id IN (
      SELECT shop_id FROM users
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );

-- Staff positions policies
CREATE POLICY "Anyone can view active positions"
  ON staff_positions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Shop admins can manage positions"
  ON staff_positions FOR ALL
  USING (
    shop_id IN (
      SELECT shop_id FROM users
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );

-- Admin profiles policies
CREATE POLICY "Admin users can view their own profile"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users in same shop can view each other"
  ON admin_profiles FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE shop_id = (SELECT shop_id FROM users WHERE id = auth.uid())
    )
  );

-- Customer profiles policies
CREATE POLICY "Customers can view their own profile"
  ON customer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can update their own profile"
  ON customer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Shop staff can view customer profiles"
  ON customer_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'ADMIN_USER'
    )
  );

-- Service categories policies
CREATE POLICY "Anyone can view active categories"
  ON service_categories FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Shop managers can manage their categories"
  ON service_categories FOR ALL
  USING (
    shop_id IN (
      SELECT shop_id FROM users
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );

-- Services policies
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Shop managers can manage their services"
  ON services FOR ALL
  USING (
    shop_id IN (
      SELECT shop_id FROM users
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );

-- Service position prices policies
CREATE POLICY "Anyone can view service prices"
  ON service_position_prices FOR SELECT
  USING (true);

CREATE POLICY "Shop managers can manage service prices"
  ON service_position_prices FOR ALL
  USING (
    service_id IN (
      SELECT id FROM services
      WHERE shop_id IN (
        SELECT shop_id FROM users
        WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
      )
    )
  );

-- Bookings policies
CREATE POLICY "Customers can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Designers can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = designer_id);

CREATE POLICY "Shop staff can view shop bookings"
  ON bookings FOR SELECT
  USING (
    shop_id IN (
      SELECT shop_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their pending bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = customer_id AND status = 'PENDING');

CREATE POLICY "Shop staff can manage shop bookings"
  ON bookings FOR ALL
  USING (
    shop_id IN (
      SELECT shop_id FROM users
      WHERE id = auth.uid() AND user_type = 'ADMIN_USER'
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Customers can create reviews for completed bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id AND status = 'COMPLETED'
    )
  );

CREATE POLICY "Customers can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Shop staff can respond to reviews"
  ON reviews FOR UPDATE
  USING (
    shop_id IN (
      SELECT shop_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Note: Uncomment below to insert sample data for testing

/*
-- Sample shop
INSERT INTO shops (id, name, business_type, phone, address, city, country)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Beautiful Salon Bangkok',
  'HAIR_SALON',
  '+66-2-123-4567',
  '123 Sukhumvit Road',
  'Bangkok',
  'TH'
);

-- Sample staff positions
INSERT INTO staff_positions (shop_id, name, name_en, level, display_order)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '인턴', 'Intern', 1, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '주니어 디자이너', 'Junior Designer', 2, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '디자이너', 'Designer', 3, 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '디렉터', 'Director', 4, 4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '스페셜 디렉터', 'Special Director', 5, 5);

-- Sample service categories
INSERT INTO service_categories (id, shop_id, name, name_en, display_order)
VALUES
  ('cat-cut', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CUT', 'Cut', 1),
  ('cat-perm', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PERM', 'Perm', 2),
  ('cat-color', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'COLOR', 'Color', 3);

-- Sample services (POSITION_BASED pricing)
INSERT INTO services (id, shop_id, category_id, name, name_en, pricing_type, duration_minutes, display_order)
VALUES
  ('svc-basic-cut', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cat-cut', '기본 컷', 'Basic Cut', 'POSITION_BASED', 30, 1);

-- Sample service prices (position-based)
INSERT INTO service_position_prices (service_id, position_id, price)
VALUES
  ('svc-basic-cut', (SELECT id FROM staff_positions WHERE name = 'Special Director' LIMIT 1), 3000.00),
  ('svc-basic-cut', (SELECT id FROM staff_positions WHERE name = 'Director' LIMIT 1), 1500.00),
  ('svc-basic-cut', (SELECT id FROM staff_positions WHERE name = 'Designer' LIMIT 1), 1200.00);

-- Sample services (FIXED pricing)
INSERT INTO services (shop_id, category_id, name, name_en, pricing_type, base_price, duration_minutes, display_order)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cat-cut', '앞머리 트리밍', 'Fringe trim Styling', 'FIXED', 600.00, 30, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cat-perm', '디자인 펌', 'Design Perm', 'FIXED', 500.00, 60, 1);
*/

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Unified users table for both admin users and customers';
COMMENT ON TABLE shops IS 'Beauty shop/salon information';
COMMENT ON TABLE staff_positions IS 'Customizable staff positions per shop (디렉터, 스페셜 디렉터, etc.)';
COMMENT ON TABLE admin_profiles IS 'Additional profile data for admin users (staff, managers, designers)';
COMMENT ON TABLE customer_profiles IS 'Additional profile data for customers with LINE integration';
COMMENT ON TABLE service_categories IS 'Service categories for organizing services (CUT, PERM, COLOR, etc.)';
COMMENT ON TABLE services IS 'Services offered by shops';
COMMENT ON TABLE service_position_prices IS 'Position-based pricing for services (only when pricing_type=POSITION_BASED)';
COMMENT ON TABLE bookings IS 'Customer bookings/appointments';
COMMENT ON TABLE reviews IS 'Customer reviews for completed bookings';

COMMENT ON COLUMN users.user_type IS 'Discriminator: ADMIN_USER or CUSTOMER';
COMMENT ON COLUMN users.role IS 'System-level role for permissions (SUPER_ADMIN, ADMIN, MANAGER, STAFF, DESIGNER, CUSTOMER)';
COMMENT ON COLUMN users.is_approved IS 'Approval status for admin users (customers auto-approved)';
COMMENT ON COLUMN users.auth_provider IS 'Authentication method used';
COMMENT ON COLUMN users.created_by IS 'User ID who created this account (for hierarchy tracking)';
COMMENT ON COLUMN staff_positions.level IS 'Hierarchy level for pricing (1=lowest, higher=more expensive)';
COMMENT ON COLUMN admin_profiles.position_id IS 'Reference to customizable staff position';
COMMENT ON COLUMN admin_profiles.permissions IS 'JSONB custom permissions for granular access control';
COMMENT ON COLUMN admin_profiles.social_links IS 'Social media links (Instagram, TikTok, YouTube, etc.)';
COMMENT ON COLUMN customer_profiles.line_user_id IS 'LINE user ID for LINE login and notifications';
COMMENT ON COLUMN services.pricing_type IS 'FIXED: single price for all, POSITION_BASED: different prices per staff position';
COMMENT ON COLUMN services.base_price IS 'Used only when pricing_type=FIXED';
