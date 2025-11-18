import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Run every hour to recalculate product quality scores
Deno.cron("calculate-product-scores", "0 * * * *", async () => {
  console.log('Cron: Starting hourly product score calculation...');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/calculate-product-scores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Cron: Quality scores updated:', result);
  } catch (error) {
    console.error('Cron: Error calculating quality scores:', error);
  }
});

// Clean up old purchase counters daily at midnight
Deno.cron("reset-purchase-counters", "0 0 * * *", async () => {
  console.log('Cron: Resetting purchase counters...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Update 7-day counter
    const { error: error7d } = await supabase.rpc('update_purchases_7d');
    if (error7d) {
      console.error('Error updating 7-day purchases:', error7d);
    }

    // Update 30-day counter
    const { error: error30d } = await supabase.rpc('update_purchases_30d');
    if (error30d) {
      console.error('Error updating 30-day purchases:', error30d);
    }

    console.log('Cron: Purchase counters reset successfully');
  } catch (error) {
    console.error('Cron: Error resetting purchase counters:', error);
  }
});

// Keep the function alive with a simple handler
Deno.serve(() => new Response('Cron jobs running'));
