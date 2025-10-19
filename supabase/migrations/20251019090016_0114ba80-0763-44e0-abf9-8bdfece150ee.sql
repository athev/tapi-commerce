-- Drop old withdrawal RLS policies
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawal_requests;

-- Admin has full access to manage withdrawals
CREATE POLICY "Admins can manage withdrawals"
ON withdrawal_requests
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Accountant can view all withdrawals
CREATE POLICY "Accountants can view withdrawals"
ON withdrawal_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'accountant'));

-- Accountant can only update approved withdrawals to completed
CREATE POLICY "Accountants can complete approved withdrawals"
ON withdrawal_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'accountant') 
  AND status = 'approved'
)
WITH CHECK (
  has_role(auth.uid(), 'accountant') 
  AND status IN ('approved', 'completed')
);