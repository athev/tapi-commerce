
import { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SellerStats from "@/components/seller/SellerStats";
import SellerProducts from "@/components/seller/SellerProducts";
import SellerOrders from "@/components/seller/SellerOrders";
import SellerWallet from "@/components/seller/SellerWallet";
import SellerAddProduct from "@/components/seller/SellerAddProduct";
import SellerStatusHandler from "@/components/seller/SellerStatusHandler";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Plus, 
  Wallet,
  User,
  Star,
  TrendingUp 
} from "lucide-react";

const SellerDashboard = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = "Dashboard Người bán | DigitalMarket";
  }, []);

  // Extract current tab from URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/wallet')) return 'wallet';
    if (path.includes('/add-product')) return 'add-product';
    return 'overview';
  };

  const currentTab = getCurrentTab();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Người bán</h1>
          <p className="text-gray-600">Quản lý sản phẩm và đơn hàng của bạn</p>
        </div>

        <SellerStatusHandler />
        
        <Routes>
          <Route path="/" element={
            <Tabs value={currentTab} className="space-y-6">
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

              <TabsContent value="overview" className="space-y-6">
                <SellerStats />
              </TabsContent>
            </Tabs>
          } />
          
          <Route path="/products" element={
            <Tabs value="products" className="space-y-6">
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

              <TabsContent value="products" className="space-y-6">
                <SellerProducts />
              </TabsContent>
            </Tabs>
          } />
          
          <Route path="/orders" element={
            <Tabs value="orders" className="space-y-6">
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

              <TabsContent value="orders" className="space-y-6">
                <SellerOrders />
              </TabsContent>
            </Tabs>
          } />

          <Route path="/wallet" element={
            <Tabs value="wallet" className="space-y-6">
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

              <TabsContent value="wallet" className="space-y-6">
                <SellerWallet />
              </TabsContent>
            </Tabs>
          } />
          
          <Route path="/add-product" element={
            <Tabs value="add-product" className="space-y-6">
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

              <TabsContent value="add-product" className="space-y-6">
                <SellerAddProduct />
              </TabsContent>
            </Tabs>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;
