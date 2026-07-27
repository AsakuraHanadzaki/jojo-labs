-- Promocodes + Website Visits + order discount columns
-- Additive only. Does NOT modify existing payment columns or logic.

-- 1) Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  -- Optional minimum order subtotal (AMD) for the code to apply
  min_order_amount numeric NOT NULL DEFAULT 0,
  -- Optional expiry. NULL = never expires
  expires_at timestamptz,
  -- Optional usage cap. NULL = unlimited
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive lookups on code
CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_code_lower_idx ON promo_codes (lower(code));

-- 2) Order discount columns (additive)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;

-- 3) Website visits table
CREATE TABLE IF NOT EXISTS page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  -- Coarse session identifier (random id stored in cookie) to estimate unique visitors
  visitor_id text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_visits_created_at_idx ON page_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS page_visits_path_idx ON page_visits (path);

-- 4) Atomic increment helper for promo usage
CREATE OR REPLACE FUNCTION increment_promo_usage(p_code text)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE lower(code) = lower(p_code);
END;
$$ LANGUAGE plpgsql;
