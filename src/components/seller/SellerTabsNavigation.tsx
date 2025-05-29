
import { Link } from "react-router-dom";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Plus, 
  Wallet 
} from "lucide-react";

const SellerTabsNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="overview" asChild>
        <Link to="/seller" className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Tổng quan</span>
        </Link>
      </TabsTrigger>
      <TabsTrigger value="products" asChild>
        <Link to="/seller/products" className="flex items-center space-x-2">
          <Package className="h-4 w-4" />
          <span>Sản phẩm</span>
        </Link>
      </TabsTrigger>
      <TabsTrigger value="orders" asChild>
        <Link to="/seller/orders" className="flex items-center space-x-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Đơn hàng</span>
        </Link>
      </TabsTrigger>
      <TabsTrigger value="wallet" asChild>
        <Link to="/seller/wallet" className="flex items-center space-x-2">
          <Wallet className="h-4 w-4" />
          <span>Ví tiền</span>
        </Link>
      </TabsTrigger>
      <TabsTrigger value="add-product" asChild>
        <Link to="/seller/add-product" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm SP</span>
        </Link>
      </TabsTrigger>
    </TabsList>
  );
};

export default SellerTabsNavigation;
