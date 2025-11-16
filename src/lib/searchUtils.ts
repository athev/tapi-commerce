/**
 * Normalize Vietnamese text for search
 * Removes diacritics and converts to lowercase
 */
export const normalizeVietnamese = (str: string): string => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
};

/**
 * Check if a product matches the search term
 */
export const matchesSearchTerm = (product: any, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const normalizedSearch = normalizeVietnamese(searchTerm);
  
  return (
    normalizeVietnamese(product.title || '').includes(normalizedSearch) ||
    normalizeVietnamese(product.description || '').includes(normalizedSearch) ||
    normalizeVietnamese(product.seller_name || '').includes(normalizedSearch) ||
    normalizeVietnamese(product.meta_title || '').includes(normalizedSearch) ||
    product.keywords?.some((kw: string) => 
      normalizeVietnamese(kw).includes(normalizedSearch)
    )
  );
};

/**
 * Calculate relevance score for search ranking
 */
export const calculateRelevanceScore = (product: any, searchTerm: string): number => {
  if (!searchTerm) return 0;
  
  let score = 0;
  const normalizedSearch = normalizeVietnamese(searchTerm.trim().toLowerCase());
  const searchWords = normalizedSearch.split(/\s+/);
  
  // Title scoring (highest priority)
  const normalizedTitle = normalizeVietnamese(product.title || '').trim();
  if (normalizedTitle === normalizedSearch) {
    score += 100; // Exact match
  } else if (normalizedTitle.includes(normalizedSearch)) {
    score += 50; // Contains phrase
  } else if (searchWords.every(word => normalizedTitle.includes(word))) {
    score += 30; // All words present
  }
  
  // Keywords scoring
  if (product.keywords?.some((kw: string) => normalizeVietnamese(kw).trim() === normalizedSearch)) {
    score += 40;
  }
  
  // Meta title scoring
  const normalizedMeta = normalizeVietnamese(product.meta_title || '').trim();
  if (normalizedMeta.includes(normalizedSearch)) {
    score += 25;
  }
  
  // Description scoring
  const normalizedDesc = normalizeVietnamese(product.description || '').trim();
  if (normalizedDesc.includes(normalizedSearch)) {
    score += 20;
  } else if (searchWords.every(word => normalizedDesc.includes(word))) {
    score += 10;
  }
  
  // Seller name scoring (lowest priority)
  if (normalizeVietnamese(product.seller_name || '').trim().includes(normalizedSearch)) {
    score += 5;
  }
  
  return score;
};
