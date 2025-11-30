-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Phase 1: Release all overdue wallet logs immediately
DO $$
DECLARE
  log_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🚀 Starting immediate release of overdue wallet logs...';
  
  -- Process all pending logs with release_date <= now()
  FOR log_record IN 
    SELECT 
      wl.id as log_id,
      wl.wallet_id,
      wl.pi_amount,
      w.user_id,
      w.pending as current_pending,
      w.available as current_available
    FROM wallet_logs wl
    INNER JOIN wallets w ON w.id = wl.wallet_id
    WHERE wl.status = 'pending'
    AND wl.release_date <= NOW()
  LOOP
    -- Update wallet: move from pending to available
    UPDATE wallets
    SET 
      pending = GREATEST(0, pending - log_record.pi_amount),
      available = available + log_record.pi_amount,
      updated_at = NOW()
    WHERE id = log_record.wallet_id;
    
    -- Update wallet log status
    UPDATE wallet_logs
    SET 
      status = 'released',
      updated_at = NOW()
    WHERE id = log_record.log_id;
    
    updated_count := updated_count + 1;
    RAISE NOTICE '✅ Released %.2f PI for wallet % (user %)', 
      log_record.pi_amount, log_record.wallet_id, log_record.user_id;
  END LOOP;
  
  RAISE NOTICE '🎉 Successfully released % overdue wallet logs', updated_count;
END $$;

-- Phase 2: Schedule wallet-cron to run every hour
SELECT cron.schedule(
  'wallet-release-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url:='https://navlxvufcajsozhvbulu.supabase.co/functions/v1/wallet-cron',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdmx4dnVmY2Fqc296aHZidWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1Mzc2MDcsImV4cCI6MjA0ODExMzYwN30.LsYzrGS5qfWbhOmXv3o-SBokv_JXLLqgk9x3FgTvGW0"}'::jsonb,
      body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);