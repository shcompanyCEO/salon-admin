-- ============================================
-- Services Table
-- ============================================

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

-- Indexes
CREATE INDEX idx_services_shop ON services(shop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_category ON services(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_active ON services(is_active, shop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_pricing_type ON services(pricing_type);

-- Comments
COMMENT ON TABLE services IS 'Services offered by shops';
COMMENT ON COLUMN services.pricing_type IS 'FIXED: single price for all, POSITION_BASED: different prices per staff position';
COMMENT ON COLUMN services.base_price IS 'Used only when pricing_type=FIXED';
