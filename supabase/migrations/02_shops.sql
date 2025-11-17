-- ============================================
-- Shops Table
-- ============================================

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

-- Indexes
CREATE INDEX idx_shops_business_type ON shops(business_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_shops_active ON shops(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_shops_location ON shops(latitude, longitude) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE shops IS 'Beauty shop/salon information';
