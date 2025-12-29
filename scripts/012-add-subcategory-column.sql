-- Add sub_category columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sub_category TEXT,
ADD COLUMN IF NOT EXISTS sub_category_ru TEXT,
ADD COLUMN IF NOT EXISTS sub_category_hy TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN products.sub_category IS 'Product sub-category for more detailed classification (e.g., AHA Exfoliant, BHA Toner, Gel Moisturizer)';
COMMENT ON COLUMN products.sub_category_ru IS 'Russian translation of sub-category';
COMMENT ON COLUMN products.sub_category_hy IS 'Armenian translation of sub-category';
