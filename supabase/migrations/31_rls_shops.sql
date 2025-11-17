-- ============================================
-- Row Level Security - Shops
-- ============================================

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Anyone can view active shops
CREATE POLICY "Anyone can view active shops"
  ON shops FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Super admins can manage all shops
CREATE POLICY "Super admins can manage all shops"
  ON shops FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Admins can update their own shop
CREATE POLICY "Admins can update their own shop"
  ON shops FOR UPDATE
  USING (
    id IN (
      SELECT shop_id FROM users
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );
