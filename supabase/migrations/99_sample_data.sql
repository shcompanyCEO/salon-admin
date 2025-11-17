-- ============================================
-- Sample Data (for development)
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
