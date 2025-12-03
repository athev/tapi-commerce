import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
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
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
}

interface SellerProfile {
  seller_rating: number;
  response_rate: number;
}

// Calculate SEO Score based on product metadata quality (v3 - no penalty for short titles)
function calculateSEOScore(product: Product): number {
  let seoScore = 0;
  
  // Title length - ONLY BONUS for optimal length, NO PENALTY for short titles
  const titleLength = product.title?.length || 0;
  if (titleLength >= 20 && titleLength <= 60) {
    seoScore += 20; // Bonus for optimal length
  }
  // No else penalty - short titles get 0, not negative
  
  // Has meta_title
  if (product.meta_title && product.meta_title.length > 0) {
    seoScore += 15;
  }
  
  // Has meta_description (100-160 chars is optimal)
  const metaDescLength = product.meta_description?.length || 0;
  if (metaDescLength >= 100 && metaDescLength <= 160) {
    seoScore += 20;
  } else if (metaDescLength > 0) {
    seoScore += 10;
  }
  
  // Has keywords (3-10 keywords is optimal)
  const keywordCount = product.keywords?.length || 0;
  if (keywordCount >= 3 && keywordCount <= 10) {
    seoScore += 20;
  } else if (keywordCount > 0) {
    seoScore += 10;
  }
  
  // Has quality product image (not placeholder)
  if (product.image && !product.image.includes('placeholder')) {
    seoScore += 15;
  }
  
  // Has detailed description (>200 chars)
  if ((product.description?.length || 0) > 200) {
    seoScore += 10;
  }
  
  return seoScore / 100; // Normalize to 0-1
}

// Calculate Sales Bonus Tiers (v3)
function calculateSalesBonus(purchases: number): number {
  let bonus = 0;
  if (purchases >= 1) bonus += 5;   // First sale bonus
  if (purchases >= 5) bonus += 5;   // 5+ sales bonus
  if (purchases >= 10) bonus += 5;  // 10+ sales bonus
  return bonus; // Returns 0, 5, 10, or 15
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

    console.log('Starting quality score calculation with v3 algorithm...');

    // Fetch all active products with SEO fields
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select(`
        id, title, description, image, views, purchases, average_rating, review_count, 
        complaint_rate, purchases_last_7_days, purchases_last_30_days, in_stock, 
        created_at, seller_id, is_mall_product, is_sponsored,
        meta_title, meta_description, keywords
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

    console.log(`Processing ${products.length} products with v3 ranking algorithm...`);

    // Fetch seller profiles
    const sellerIds = [...new Set(products.map(p => p.seller_id))];
    const { data: sellers } = await supabaseClient
      .from('profiles')
      .select('id, seller_rating, response_rate')
      .in('id', sellerIds);

    const sellerMap = new Map(
      sellers?.map(s => [s.id, s as SellerProfile]) || []
    );

    // Calculate scores for each product using v3 algorithm
    const updates = products.map((product: Product) => {
      const seller = sellerMap.get(product.seller_id);
      
      // 1. VIEWS SCORE (10%) - Logarithmic scale up to 10000 views (reduced from 15%)
      const views = product.views || 0;
      const viewsScore = views > 0 
        ? Math.min(Math.log10(views + 1) / Math.log10(10000), 1) 
        : 0;
      
      // 2. REVIEWS SCORE (15%) - Logarithmic scale up to 500 reviews
      const reviewCount = product.review_count || 0;
      const reviewsScore = reviewCount > 0 
        ? Math.min(Math.log10(reviewCount + 1) / Math.log10(500), 1) 
        : 0;
      
      // 3. RATING SCORE (15%) - Scale 1-5 stars to 0-1
      const avgRating = product.average_rating || 5;
      const ratingScore = (avgRating - 1) / 4;
      
      // 4. SALES SCORE (20%) - LINEAR formula for better low-sales reward (increased from 15%)
      const purchases = product.purchases || 0;
      const salesScore = Math.min(purchases / 50, 1); // Linear: 1 sale = 2%, 10 = 20%, 50+ = 100%
      
      // 5. COMPLAINT SCORE (10%) - Lower complaints = higher score
      const complaintRate = product.complaint_rate || 0;
      const complaintScore = Math.max(0, 1 - (complaintRate * 10));
      
      // 6. STOCK SCORE (5%) - Simplified: out of stock = 0, in stock = 1 (reduced from 10%)
      const inStock = product.in_stock || 0;
      const stockScore = inStock > 0 ? 1 : 0; // Binary: either in stock or not
      
      // 7. SEO SCORE (10%) - Based on metadata quality (no penalty for short titles)
      const seoScore = calculateSEOScore(product);
      
      // 8. FRESHNESS SCORE (5%) - Exponential decay over 90 days
      const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const freshnessScore = Math.exp(-daysSinceCreated / 90);
      
      // 9. SELLER QUALITY (10%) - Rating + response rate (increased from 5%)
      const sellerRating = seller?.seller_rating ? seller.seller_rating / 5 : 0.8;
      const responseRate = seller?.response_rate ? seller.response_rate / 100 : 0.95;
      const sellerQuality = (sellerRating * 0.7) + (responseRate * 0.3);
      
      // Aggregate Quality Score with v3 weights
      let qualityScore = 
        (0.10 * viewsScore * 100) +      // Views: 10% (was 15%)
        (0.15 * reviewsScore * 100) +    // Reviews: 15%
        (0.15 * ratingScore * 100) +     // Rating: 15%
        (0.20 * salesScore * 100) +      // Sales: 20% (was 15%)
        (0.10 * complaintScore * 100) +  // Complaints: 10%
        (0.05 * stockScore * 100) +      // Stock: 5% (was 10%)
        (0.10 * seoScore * 100) +        // SEO: 10%
        (0.05 * freshnessScore * 100) +  // Freshness: 5%
        (0.10 * sellerQuality * 100);    // Seller: 10% (was 5%)
      
      // Add Sales Bonus Tiers (v3 new feature)
      const salesBonus = calculateSalesBonus(purchases);
      qualityScore += salesBonus;
      
      // Business Rules Boosting
      let finalScore = qualityScore;
      if (product.is_mall_product) finalScore *= 1.3;  // +30% for Mall products
      if (product.is_sponsored) finalScore *= 1.5;     // +50% for Sponsored
      if (seller && sellerRating > 0.9) finalScore *= 1.2; // +20% for 4.5+ star seller
      
      // Log detailed breakdown for debugging (sample)
      if (Math.random() < 0.2) { // Log 20% of products
        console.log(`Product ${product.id} (${product.title?.substring(0, 30)}...):`, {
          views: viewsScore.toFixed(2),
          reviews: reviewsScore.toFixed(2),
          rating: ratingScore.toFixed(2),
          sales: `${salesScore.toFixed(2)} (${purchases} purchases)`,
          salesBonus: salesBonus,
          complaints: complaintScore.toFixed(2),
          stock: stockScore.toFixed(2),
          seo: seoScore.toFixed(2),
          freshness: freshnessScore.toFixed(2),
          seller: sellerQuality.toFixed(2),
          base: qualityScore.toFixed(2),
          final: finalScore.toFixed(2)
        });
      }
      
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

    console.log(`Successfully updated ${updatedCount} products with v3 ranking algorithm`);

    return new Response(
      JSON.stringify({ 
        message: 'Quality scores calculated with v3 algorithm',
        updated: updatedCount,
        total: products.length,
        algorithm: 'v3-sales-priority'
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
