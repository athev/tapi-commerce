import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HeroSearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (category !== 'all') {
      params.set('category', category);
    }
    if (priceRange !== 'all') {
      params.set('price', priceRange);
    }
    navigate(`/search?${params.toString()}`);
  };

  const popularKeywords = ['Canva Pro', 'ChatGPT', 'Netflix', 'Spotify', 'Notion'];

  return (
    <section className="bg-gradient-to-b from-muted/50 to-background py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
            <span className="text-foreground">Tìm Sản Phẩm Số </span>
            <span className="text-primary">Hoàn Hảo</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            Khóa học, tài khoản, phần mềm và nhiều hơn nữa
          </p>

          {/* Search Form - Combined in one row */}
          <form onSubmit={handleSearch}>
            <div className="bg-card rounded-xl md:rounded-full shadow-lg border border-border p-1.5 md:p-2">
              <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 md:h-11 pl-9 pr-3 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  />
                </div>

                {/* Divider (Desktop) */}
                <div className="hidden md:block w-px bg-border my-2" />

                {/* Category Select */}
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 md:h-11 w-full md:w-[140px] border-0 bg-transparent focus:ring-0 text-sm">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="khoa-hoc">Khóa học</SelectItem>
                    <SelectItem value="tai-khoan">Tài khoản</SelectItem>
                    <SelectItem value="phan-mem">Phần mềm</SelectItem>
                    <SelectItem value="dich-vu">Dịch vụ</SelectItem>
                  </SelectContent>
                </Select>

                {/* Divider (Desktop) */}
                <div className="hidden md:block w-px bg-border my-2" />

                {/* Price Select */}
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-10 md:h-11 w-full md:w-[130px] border-0 bg-transparent focus:ring-0 text-sm">
                    <SelectValue placeholder="Giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả giá</SelectItem>
                    <SelectItem value="0-100000">Dưới 100k</SelectItem>
                    <SelectItem value="100000-500000">100k - 500k</SelectItem>
                    <SelectItem value="500000-1000000">500k - 1tr</SelectItem>
                    <SelectItem value="1000000-99999999">Trên 1tr</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search Button */}
                <Button
                  type="submit"
                  className="h-10 md:h-11 rounded-lg md:rounded-full px-6 font-medium"
                >
                  <Search className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Tìm kiếm</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Popular Keywords */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Phổ biến:</span>
            {popularKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => {
                  setSearchQuery(keyword);
                  navigate(`/search?q=${encodeURIComponent(keyword)}`);
                }}
                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border rounded-full transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearchSection;
