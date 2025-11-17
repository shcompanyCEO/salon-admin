-- ============================================
-- Admin Profiles Table
-- ============================================

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

-- Indexes
CREATE INDEX idx_admin_profiles_position ON admin_profiles(position_id);

-- Comments
COMMENT ON TABLE admin_profiles IS 'Additional profile data for admin users (staff, managers, designers)';
COMMENT ON COLUMN admin_profiles.position_id IS 'Reference to customizable staff position';
COMMENT ON COLUMN admin_profiles.permissions IS 'JSONB custom permissions for granular access control';
COMMENT ON COLUMN admin_profiles.social_links IS 'Social media links (Instagram, TikTok, YouTube, etc.)';
