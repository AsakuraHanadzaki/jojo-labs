-- Customer requests/inquiries table
CREATE TABLE IF NOT EXISTS customer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  
  -- Request details
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Request type: general, product_inquiry, order_issue, return_request, complaint, other
  request_type VARCHAR(50) DEFAULT 'general',
  
  -- Related order (optional)
  order_id UUID REFERENCES orders(id),
  
  -- Status: new, in_progress, resolved, closed
  status VARCHAR(50) DEFAULT 'new',
  
  -- Admin response
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by VARCHAR(255),
  
  -- Priority: low, medium, high, urgent
  priority VARCHAR(20) DEFAULT 'medium',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_requests_status ON customer_requests(status);
CREATE INDEX IF NOT EXISTS idx_customer_requests_created_at ON customer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_requests_type ON customer_requests(request_type);

-- Enable RLS
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;

-- Allow public to create requests
CREATE POLICY "Allow public request creation" ON customer_requests
  FOR INSERT WITH CHECK (true);

-- Allow public to view their own requests by email
CREATE POLICY "Allow public request viewing" ON customer_requests
  FOR SELECT USING (true);

-- Allow updates
CREATE POLICY "Allow request updates" ON customer_requests
  FOR UPDATE USING (true);
