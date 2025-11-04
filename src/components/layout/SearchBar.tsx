import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


interface SearchBarProps {
  onSearchComplete?: () => void;
}

const SearchBar = ({ onSearchComplete }: SearchBarProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch trending searches from database
  const { data: trendingSearches } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('keywords')
        .eq('status', 'active')
        .not('keywords', 'is', null)
        .limit(100);
      
      // Flatten and count keywords
      const keywordCounts = new Map<string, number>();
      data?.forEach(p => {
        p.keywords?.forEach((kw: string) => {
          keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
        });
      });
      
      // Sort and get top 6
      return Array.from(keywordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([keyword]) => keyword);
    },
    staleTime: 10 * 60 * 1000, // Cache 10 minutes
    enabled: showSuggestions
  });

  // Fetch popular products
  const { data: popularProducts } = useQuery({
    queryKey: ['popular-search-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, image, category')
        .eq('status', 'active')
        .order('purchases', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    enabled: showSuggestions
  });

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Sync input with URL search param
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }

    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;

    // Save to history
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    // Navigate - keep search term in input
    navigate(`/?search=${encodeURIComponent(term.trim())}`);
    setShowSuggestions(false);
    inputRef.current?.blur();
    
    // Notify parent to close dialog
    onSearchComplete?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Tìm sản phẩm, khóa học, dịch vụ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="h-10 pr-20 bg-muted/50 border-border focus-visible:ring-primary"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1 h-8 bg-primary hover:bg-primary/90"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Lịch sử tìm kiếm</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            {/* Trending Keywords from Database */}
            {trendingSearches && trendingSearches.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">Đề xuất tìm kiếm</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {trendingSearches.map((keyword, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(keyword)}
                      className="flex items-center gap-2 p-2 text-sm hover:bg-muted rounded transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded flex items-center justify-center flex-shrink-0">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{keyword}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Products */}
            {popularProducts && popularProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">Danh mục tìm kiếm nhiều</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {popularProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setShowSuggestions(false);
                        onSearchComplete?.();
                      }}
                      className="flex items-center gap-2.5 p-2 hover:bg-muted rounded transition-colors text-left group"
                    >
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span className="text-sm line-clamp-2 flex-1">{product.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setShowSuggestions(false)}
              className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Đóng kết quả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
