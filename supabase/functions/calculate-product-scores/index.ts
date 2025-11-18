import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  views: number;
  purchases: number;
  average_rating: number;
  review_count: number;
  complaint_rate: number;
  purchases_last_7_days: number;
  purchases_last_30_days: number;
  in_stock: number;
  created_at: string;
  seller_id: string;
  is_mall_product: boolean;
  is_sponsored: boolean;
}

interface SellerProfile {
  seller_rating: number;
  response_rate: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting quality score calculation...');

    // Fetch all active products
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select(`
        id, views, purchases, average_rating, review_count, complaint_rate,
        purchases_last_7_days, purchases_last_30_days, in_stock, created_at,
        seller_id, is_mall_product, is_sponsored
      `)
      .eq('status', 'active');

    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      console.log('No active products found');
      return new Response(
        JSON.stringify({ message: 'No products to calculate', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${products.length} products...`);

    // Fetch seller profiles
    const sellerIds = [...new Set(products.map(p => p.seller_id))];
    const { data: sellers } = await supabaseClient
      .from('profiles')
      .select('id, seller_rating, response_rate')
      .in('id', sellerIds);

    const sellerMap = new Map(
      sellers?.map(s => [s.id, s as SellerProfile]) || []
    );

    // Calculate scores for each product
    const updates = products.map((product: Product) => {
      const seller = sellerMap.get(product.seller_id);
      
      // 1. Conversion Rate (25%)
      const conversionRate = product.views > 0 
        ? Math.min((product.purchases / product.views) * 100, 100) 
        : 0;
      
      // 2. Rating Score (20%)
      const ratingNormalized = (product.average_rating || 5) / 5;
      const reviewWeight = product.review_count > 0 
        ? Math.min(Math.log(product.review_count + 1) / Math.log(1000), 1) 
        : 0;
      const complaintFactor = 1 - (product.complaint_rate || 0);
      const ratingScore = (ratingNormalized * 0.7) + (reviewWeight * 0.2) + (complaintFactor * 0.1);
      
      // 3. Sales Velocity (15%)
      const recentSales = (product.purchases_last_7_days * 4) + (product.purchases_last_30_days || 0);
      const salesVelocity = Math.min(recentSales / 100, 1);
      
      // 4. Seller Quality (15%)
      const sellerRating = seller?.seller_rating ? seller.seller_rating / 5 : 0.8;
      const responseRate = seller?.response_rate ? seller.response_rate / 100 : 0.95;
      const sellerQuality = (sellerRating * 0.6) + (responseRate * 0.4);
      
      // 5. Freshness Score (10%)
      const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const freshness = Math.exp(-daysSinceCreated / 30);
      
      // 6. Stock Health (5%)
      const stockHealth = Math.min((product.in_stock || 0) / 50, 1);
      
      // Aggregate Quality Score
      const qualityScore = 
        (0.25 * conversionRate) +
        (0.20 * ratingScore * 100) +
        (0.15 * salesVelocity * 100) +
        (0.15 * sellerQuality * 100) +
        (0.10 * freshness * 100) +
        (0.05 * stockHealth * 100);
      
      // Business Rules Boosting
      let finalScore = qualityScore;
      if (product.is_mall_product) finalScore *= 1.3;
      if (seller && sellerRating > 0.9) finalScore *= 1.2; // Verified high-rated seller
      if (product.is_sponsored) finalScore *= 1.5;
      
      return {
        id: product.id,
        quality_score: Math.round(finalScore * 100) / 100,
        last_score_calculated_at: new Date().toISOString()
      };
    });

    console.log(`Updating ${updates.length} product scores...`);

    // Batch update in chunks of 50
    const chunkSize = 50;
    let updatedCount = 0;
    
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      
      for (const update of chunk) {
        const { error } = await supabaseClient
          .from('products')
          .update({
            quality_score: update.quality_score,
            last_score_calculated_at: update.last_score_calculated_at
          })
          .eq('id', update.id);
        
        if (error) {
          console.error(`Error updating product ${update.id}:`, error);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} products`);

    return new Response(
      JSON.stringify({ 
        message: 'Quality scores calculated successfully',
        updated: updatedCount,
        total: products.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating quality scores:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
