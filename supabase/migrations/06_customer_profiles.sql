-- ============================================
-- Customer Profiles Table
-- ============================================

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

-- Indexes
CREATE INDEX idx_customer_profiles_line ON customer_profiles(line_user_id);
CREATE INDEX idx_customer_profiles_shop ON customer_profiles(preferred_shop_id);

-- Comments
COMMENT ON TABLE customer_profiles IS 'Additional profile data for customers with LINE integration';
COMMENT ON COLUMN customer_profiles.line_user_id IS 'LINE user ID for LINE login and notifications';
