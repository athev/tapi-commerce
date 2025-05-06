
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  useEffect(() => {
    document.title = "Không tìm thấy trang | DigitalMarket";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container py-16 text-center">
          <h1 className="text-7xl font-bold text-gray-900 mb-6">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Không tìm thấy trang</h2>
          <p className="text-xl text-gray-500 mb-8 max-w-lg mx-auto">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến vị trí khác.
          </p>
          <Button asChild size="lg">
            <Link to="/">Quay lại trang chủ</Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
