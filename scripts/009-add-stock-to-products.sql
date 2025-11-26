-- Add stock management columns to products table if they don't exist
DO $$ 
BEGIN
  -- Add stock column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 100;
  END IF;
  
  -- Add low_stock_threshold column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
  END IF;
  
  -- Add in_stock column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'in_stock') THEN
    ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create function to auto-update in_stock based on stock level
CREATE OR REPLACE FUNCTION update_in_stock()
RETURNS TRIGGER AS $$
BEGIN
  NEW.in_stock = NEW.stock > 0;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update in_stock
DROP TRIGGER IF EXISTS trigger_update_in_stock ON products;
CREATE TRIGGER trigger_update_in_stock
  BEFORE UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_in_stock();

-- Create function to decrease stock when order is placed
CREATE OR REPLACE FUNCTION decrease_product_stock(p_product_id VARCHAR, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;
