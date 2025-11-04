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
