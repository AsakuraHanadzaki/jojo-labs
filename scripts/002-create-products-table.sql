-- Create products table with all necessary fields
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Product info in English
  name_en TEXT NOT NULL,
  description_en TEXT NOT NULL,
  
  -- Product info in Russian
  name_ru TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  
  -- Product info in Armenian
  name_hy TEXT NOT NULL,
  description_hy TEXT NOT NULL,
  
  -- Pricing and image
  price TEXT NOT NULL,
  image TEXT NOT NULL,
  
  -- Benefits (array of text)
  benefits_en TEXT[] NOT NULL DEFAULT '{}',
  benefits_ru TEXT[] NOT NULL DEFAULT '{}',
  benefits_hy TEXT[] NOT NULL DEFAULT '{}',
  
  -- How to use (array of text)
  how_to_use_en TEXT[] NOT NULL DEFAULT '{}',
  how_to_use_ru TEXT[] NOT NULL DEFAULT '{}',
  how_to_use_hy TEXT[] NOT NULL DEFAULT '{}',
  
  -- Ingredients (array of text)
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  
  -- Skin type info
  skin_type_en TEXT NOT NULL,
  skin_type_ru TEXT NOT NULL,
  skin_type_hy TEXT NOT NULL,
  
  -- Additional fields
  size TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  eco BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
