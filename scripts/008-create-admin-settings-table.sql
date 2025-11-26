-- Admin settings table for storing admin access code
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin code (change this in production!)
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_code', 'JOJO2024')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only allow read access (for code verification)
CREATE POLICY "Allow admin settings read" ON admin_settings
  FOR SELECT USING (true);

-- Allow updates to settings
CREATE POLICY "Allow admin settings update" ON admin_settings
  FOR UPDATE USING (true);
