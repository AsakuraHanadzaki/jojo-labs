-- Create blogs table for admin-managed blog posts
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_ru TEXT,
  title_hy TEXT,
  excerpt TEXT NOT NULL,
  excerpt_ru TEXT,
  excerpt_hy TEXT,
  content TEXT NOT NULL,
  content_ru TEXT,
  content_hy TEXT,
  featured_image TEXT,
  author TEXT NOT NULL DEFAULT 'Admin',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for published blogs
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Allow public to read published blogs
CREATE POLICY "Allow public to read published blogs"
  ON blogs FOR SELECT
  USING (published = true);

-- Allow all operations for authenticated admin (will be controlled by admin code check)
CREATE POLICY "Allow blog management"
  ON blogs FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE blogs IS 'Blog posts managed by admin, readable by all users';
