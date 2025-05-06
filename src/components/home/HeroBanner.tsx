
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroBanner = () => {
  return (
    <div className="bg-marketplace-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/public/lovable-uploads/971e6062-967c-4572-b3a0-d72b2f1b4a2f.png')] bg-cover bg-center opacity-20"></div>
      <div className="container relative z-10 py-16 md:py-24 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Sàn thương mại điện tử sản phẩm số
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl">
          Nơi mua bán các sản phẩm số, khóa học và dịch vụ trực tuyến uy tín nhất Việt Nam
        </p>
        
        <div className="w-full max-w-2xl bg-white rounded-lg flex items-center overflow-hidden p-1">
          <Input 
            type="search"
            placeholder="Tìm kiếm sản phẩm, khóa học, dịch vụ..."
            className="border-0 shadow-none focus-visible:ring-0 flex-1"
          />
          <Button className="bg-marketplace-primary hover:bg-marketplace-primary/90">
            <Search className="h-4 w-4 mr-2" /> Tìm kiếm
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Link to="/category/courses">Khóa học</Link>
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Link to="/category/software">Phần mềm</Link>
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Link to="/category/accounts">Tài khoản</Link>
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Link to="/category/services">Dịch vụ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
