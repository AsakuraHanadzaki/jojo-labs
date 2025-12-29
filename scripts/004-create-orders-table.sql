-- Orders table to track customer orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  
  -- Shipping address
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_country VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20),
  
  -- Order status: pending, confirmed, processing, shipped, delivered, cancelled
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Payment info
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  
  -- Totals
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Delivery tracking
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  estimated_delivery DATE,
  actual_delivery DATE,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read for order tracking (by order number)
CREATE POLICY "Allow public order tracking" ON orders
  FOR SELECT USING (true);

-- Allow public insert for creating orders
CREATE POLICY "Allow public order creation" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow public update for order status changes
CREATE POLICY "Allow public order updates" ON orders
  FOR UPDATE USING (true);
