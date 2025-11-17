-- ============================================
-- Row Level Security - Admin & Customer Profiles
-- ============================================

-- Admin Profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

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

-- Customer Profiles
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

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
