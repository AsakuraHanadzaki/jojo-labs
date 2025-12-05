-- Add translated ingredients columns (Russian and Armenian)
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients_ru TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients_hy TEXT[];

-- Add concerns columns (English, Russian, Armenian)
ALTER TABLE products ADD COLUMN IF NOT EXISTS concerns TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS concerns_ru TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS concerns_hy TEXT[];
