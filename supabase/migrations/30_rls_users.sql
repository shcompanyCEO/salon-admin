-- ============================================
-- Row Level Security - Users
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Super admins can view all users
CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Users can view same shop users
CREATE POLICY "Users can view same shop users"
  ON users FOR SELECT
  USING (
    shop_id IN (
      SELECT shop_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can create users in their shop
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
