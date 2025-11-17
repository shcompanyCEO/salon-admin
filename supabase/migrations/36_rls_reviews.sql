-- ============================================
-- Row Level Security - Reviews
-- ============================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible reviews
CREATE POLICY "Anyone can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

-- Customers can create reviews for completed bookings
CREATE POLICY "Customers can create reviews for completed bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id AND status = 'COMPLETED'
    )
  );

-- Customers can update their own reviews
CREATE POLICY "Customers can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = customer_id);

-- Shop staff can respond to reviews
CREATE POLICY "Shop staff can respond to reviews"
  ON reviews FOR UPDATE
  USING (
    shop_id IN (
      SELECT shop_id FROM users WHERE id = auth.uid()
    )
  );
