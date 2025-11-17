-- Allow sellers to update delivery_status and delivery_notes for their products' orders
CREATE POLICY "Sellers can update delivery status for their orders"
ON orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = orders.product_id 
    AND p.seller_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = orders.product_id 
    AND p.seller_id = auth.uid()
  )
);

-- Allow sellers to create order_support conversations for their orders
CREATE POLICY "Sellers can create order support conversations"
ON conversations
FOR INSERT
WITH CHECK (
  -- Seller must be the actual seller_id in the conversation
  auth.uid() = seller_id
  AND
  -- Chat type must be order_support
  chat_type = 'order_support'
  AND
  -- Order must exist and belong to this seller's product
  EXISTS (
    SELECT 1 FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.id = order_id
    AND p.seller_id = auth.uid()
    AND o.user_id = buyer_id
  )
);

-- Add comments for documentation
COMMENT ON POLICY "Sellers can update delivery status for their orders" ON orders IS 
'Allows sellers to update delivery_status and delivery_notes fields for orders of their products';

COMMENT ON POLICY "Sellers can create order support conversations" ON conversations IS
'Allows sellers to initiate order support chat with buyers after receiving an order';