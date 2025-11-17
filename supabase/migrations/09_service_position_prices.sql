-- ============================================
-- Service Position Prices Table
-- ============================================
-- Used only for services with pricing_type='POSITION_BASED'

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

-- Indexes
CREATE INDEX idx_service_position_prices_service ON service_position_prices(service_id);
CREATE INDEX idx_service_position_prices_position ON service_position_prices(position_id);

-- Comments
COMMENT ON TABLE service_position_prices IS 'Position-based pricing for services (only when pricing_type=POSITION_BASED)';
