import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeroSearchSectionProps {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
}

const HeroSearchSection = ({
  backgroundImage = "/lovable-uploads/bc39c71c-0a95-45a8-8b9c-550af21ab54a.png",
  title = "Tìm Sản Phẩm Số Hoàn Hảo",
  subtitle = "Khóa học, tài khoản, phần mềm và nhiều hơn nữa"
}: HeroSearchSectionProps) => {
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10">
            {subtitle}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm, khóa học, dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-base bg-background/80 backdrop-blur-sm border-2 border-border focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 rounded-xl shadow-lg"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 bg-background/80 backdrop-blur-sm border-2 border-border rounded-xl">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="khoa-hoc">Khóa học</SelectItem>
                  <SelectItem value="tai-khoan">Tài khoản</SelectItem>
                  <SelectItem value="phan-mem">Phần mềm</SelectItem>
                  <SelectItem value="dich-vu">Dịch vụ</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range Filter */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-12 bg-background/80 backdrop-blur-sm border-2 border-border rounded-xl">
                  <SelectValue placeholder="Khoảng giá" />
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
                size="lg"
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold sm:min-w-[140px]"
              >
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </form>

          {/* Popular Keywords */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Phổ biến:</span>
            {['Canva Pro', 'ChatGPT', 'Netflix', 'Spotify', 'Notion'].map((keyword) => (
              <button
                key={keyword}
                onClick={() => {
                  setSearchQuery(keyword);
                  navigate(`/search?q=${encodeURIComponent(keyword)}`);
                }}
                className="px-3 py-1 text-xs bg-muted/80 hover:bg-muted border border-border rounded-full transition-colors"
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
