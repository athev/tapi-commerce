import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const POPULAR_SEARCHES = [
  "Ebook kinh doanh",
  "Khóa học marketing",
  "Template website",
  "Phần mềm thiết kế",
  "Khóa học lập trình"
];

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
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

    // Navigate
    navigate(`/?search=${encodeURIComponent(term.trim())}`);
    setShowSuggestions(false);
    setSearchTerm("");
    inputRef.current?.blur();
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">Tìm kiếm gần đây</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Xóa
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded text-left"
                  >
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="p-3">
            <span className="text-xs text-muted-foreground font-medium mb-2 block">
              Tìm kiếm phổ biến
            </span>
            <div className="space-y-1">
              {POPULAR_SEARCHES.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded text-left"
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
