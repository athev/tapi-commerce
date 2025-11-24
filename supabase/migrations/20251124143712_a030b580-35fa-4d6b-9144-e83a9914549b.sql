-- Phase 1: Service Products Database Schema

-- Create service_tickets table
CREATE TABLE service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Ticket info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  request_data JSONB,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
  
  -- Pricing
  quoted_price INTEGER,
  quoted_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Order link
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Completion
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_service_tickets_buyer ON service_tickets(buyer_id);
CREATE INDEX idx_service_tickets_seller ON service_tickets(seller_id);
CREATE INDEX idx_service_tickets_product ON service_tickets(product_id);
CREATE INDEX idx_service_tickets_status ON service_tickets(status);
CREATE INDEX idx_service_tickets_conversation ON service_tickets(conversation_id);

-- Enable RLS
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Buyers can view their own tickets"
  ON service_tickets FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view their product tickets"
  ON service_tickets FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Buyers can create tickets"
  ON service_tickets FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update their tickets"
  ON service_tickets FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Buyers can update their tickets (limited)"
  ON service_tickets FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid() AND status IN ('pending', 'quoted', 'accepted'));

-- Update trigger for updated_at
CREATE TRIGGER update_service_tickets_updated_at
  BEFORE UPDATE ON service_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();