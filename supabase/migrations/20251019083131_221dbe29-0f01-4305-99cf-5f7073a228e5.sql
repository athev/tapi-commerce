-- Drop old constraint requiring 100 PI minimum
ALTER TABLE withdrawal_requests 
DROP CONSTRAINT IF EXISTS min_withdrawal_amount;

-- Add new constraint with 10 PI minimum
ALTER TABLE withdrawal_requests 
ADD CONSTRAINT min_withdrawal_amount 
CHECK (pi_amount >= 10);