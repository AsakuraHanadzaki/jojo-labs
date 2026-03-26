-- Add E-HDM (Armenian Tax Fiscalization) columns to orders table
-- Run this migration to enable fiscal receipt tracking

ALTER TABLE orders ADD COLUMN IF NOT EXISTS ehdm_receipt_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ehdm_receipt_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ehdm_unique_code VARCHAR(30);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ehdm_fiscalized_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ehdm_refund_receipt_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ehdm_refund_receipt_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Create index for E-HDM receipt lookups
CREATE INDEX IF NOT EXISTS idx_orders_ehdm_receipt_id ON orders(ehdm_receipt_id);
CREATE INDEX IF NOT EXISTS idx_orders_ehdm_unique_code ON orders(ehdm_unique_code);

COMMENT ON COLUMN orders.ehdm_receipt_id IS 'E-HDM fiscal receipt ID from PayX';
COMMENT ON COLUMN orders.ehdm_receipt_url IS 'URL to the fiscal receipt PDF';
COMMENT ON COLUMN orders.ehdm_unique_code IS 'Unique code sent to E-HDM (max 30 chars)';
COMMENT ON COLUMN orders.ehdm_fiscalized_at IS 'Timestamp when order was fiscalized';
