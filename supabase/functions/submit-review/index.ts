import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { order_id, product_id, rating, comment, images, variant_name } = await req.json();
    console.log('📝 Submit review request:', { order_id, product_id, rating, user_id: user.id });

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ success: false, error: 'Rating must be between 1 and 5' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify order belongs to user and is paid
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, product_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(JSON.stringify({ success: false, error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (order.user_id !== user.id) {
      return new Response(JSON.stringify({ success: false, error: 'Order does not belong to user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (order.status !== 'paid') {
      return new Response(JSON.stringify({ success: false, error: 'Order is not paid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', order_id)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return new Response(JSON.stringify({ success: false, error: 'You have already reviewed this order' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        order_id,
        product_id,
        user_id: user.id,
        rating,
        comment: comment || null,
        images: images || [],
        variant_name: variant_name || null,
        pi_rewarded: rating === 5 // Only reward PI for 5-star reviews
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to create review' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Review created:', review.id);

    // Handle PI reward (only for 5-star reviews)
    let piRewarded = false;
    let newBalance = 0;
    const piAmount = 1;

    if (rating === 5) {
      // Get or create buyer wallet
      let { data: wallet } = await supabase
        .from('buyer_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!wallet) {
        const { data: newWallet, error: walletError } = await supabase
          .from('buyer_wallets')
          .insert({
            user_id: user.id,
            pi_balance: 0,
            total_earned: 0
          })
          .select()
          .single();

        if (walletError) {
          console.error('Error creating wallet:', walletError);
        } else {
          wallet = newWallet;
        }
      }

      if (wallet) {
        // Update wallet balance
        const { data: updatedWallet, error: updateError } = await supabase
          .from('buyer_wallets')
          .update({
            pi_balance: wallet.pi_balance + piAmount,
            total_earned: wallet.total_earned + piAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id)
          .select()
          .single();

        if (!updateError && updatedWallet) {
          newBalance = updatedWallet.pi_balance;
          piRewarded = true;

          // Create PI log
          await supabase
            .from('buyer_pi_logs')
            .insert({
              buyer_wallet_id: wallet.id,
              review_id: review.id,
              pi_amount: piAmount,
              type: 'review_reward',
              description: `Đánh giá 5⭐ sản phẩm`
            });

          console.log('💰 PI rewarded:', piAmount, 'New balance:', newBalance);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      review_id: review.id,
      pi_rewarded: piRewarded,
      pi_amount: piRewarded ? piAmount : 0,
      new_balance: newBalance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in submit-review:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
