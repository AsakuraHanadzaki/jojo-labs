-- Product ratings and reviews table
CREATE TABLE IF NOT EXISTS product_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product reference
  product_id VARCHAR(255) NOT NULL,
  
  -- Reviewer info
  reviewer_name VARCHAR(255) NOT NULL,
  reviewer_email VARCHAR(255) NOT NULL,
  
  -- Rating (1-5 stars)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Review content
  title VARCHAR(255),
  review TEXT,
  
  -- Verification
  verified_purchase BOOLEAN DEFAULT false,
  order_id UUID REFERENCES orders(id),
  
  -- Moderation: pending, approved, rejected
  moderation_status VARCHAR(50) DEFAULT 'pending',
  moderation_notes TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ratings_status ON product_ratings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_product_ratings_rating ON product_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_product_ratings_created_at ON product_ratings(created_at DESC);

-- Enable RLS
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;

-- Allow public to create ratings
CREATE POLICY "Allow public rating creation" ON product_ratings
  FOR INSERT WITH CHECK (true);

-- Allow public to view approved ratings
CREATE POLICY "Allow public approved ratings viewing" ON product_ratings
  FOR SELECT USING (true);

-- Allow updates
CREATE POLICY "Allow rating updates" ON product_ratings
  FOR UPDATE USING (true);
