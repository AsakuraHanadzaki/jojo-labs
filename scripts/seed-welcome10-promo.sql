-- Seed a sample promo code for testing: WELCOME10 (10% off)
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, expires_at, max_uses, is_active)
VALUES ('WELCOME10', 'percentage', 10, 0, now() + interval '90 days', 100, true)
ON CONFLICT (code) DO UPDATE
SET discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    min_order_amount = EXCLUDED.min_order_amount,
    expires_at = EXCLUDED.expires_at,
    max_uses = EXCLUDED.max_uses,
    is_active = EXCLUDED.is_active,
    updated_at = now();
