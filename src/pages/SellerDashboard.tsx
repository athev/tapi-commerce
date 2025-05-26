
import { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import SellerProducts from "@/components/seller/SellerProducts";
import SellerOrders from "@/components/seller/SellerOrders";
import SellerAddProduct from "@/components/seller/SellerAddProduct";
import SellerStats from "@/components/seller/SellerStats";
import SellerPromotions from "@/components/seller/SellerPromotions";
import SellerReviews from "@/components/seller/SellerReviews";
import SellerAnalytics from "@/components/seller/SellerAnalytics";
import NotificationCenter from "@/components/seller/NotificationCenter";
import SellerStatusHandler from "@/components/seller/SellerStatusHandler";
import Chat from "@/pages/Chat";

const SellerDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveTab = () => {
    if (currentPath.includes('/seller/orders')) return 'orders';
    if (currentPath.includes('/seller/products/add')) return 'add';
    if (currentPath.includes('/seller/products')) return 'products';
    if (currentPath.includes('/seller/promotions')) return 'promotions';
    if (currentPath.includes('/seller/reviews')) return 'reviews';
    if (currentPath.includes('/seller/analytics')) return 'analytics';
    if (currentPath.includes('/seller/notifications')) return 'notifications';
    if (currentPath.includes('/seller/chat')) return 'chat';
    return 'dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kênh người bán</h1>
            <p className="text-gray-500">Xin chào, {profile?.full_name}</p>
          </div>
          
          {/* Only show the add button for approved sellers */}
          {profile?.role === 'seller' && (
            <Button 
              onClick={() => navigate('/seller/products/add')}
              className="bg-green-600 hover:bg-green-700"
            >
              Thêm mới
            </Button>
          )}
        </div>
        
        {/* Only show tabs for approved sellers */}
        {profile?.role === 'seller' && (
          <Tabs 
            value={getActiveTab()}
            onValueChange={(value) => {
              switch(value) {
                case 'dashboard':
                  navigate('/seller');
                  break;
                case 'products':
                  navigate('/seller/products');
                  break;
                case 'orders':
                  navigate('/seller/orders');
                  break;
                case 'add':
                  navigate('/seller/products/add');
                  break;
                case 'promotions':
                  navigate('/seller/promotions');
                  break;
                case 'reviews':
                  navigate('/seller/reviews');
                  break;
                case 'analytics':
                  navigate('/seller/analytics');
                  break;
                case 'notifications':
                  navigate('/seller/notifications');
                  break;
                case 'chat':
                  navigate('/seller/chat');
                  break;
              }
            }}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="dashboard">Tổng quan</TabsTrigger>
              <TabsTrigger value="products">Sản phẩm</TabsTrigger>
              <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
              <TabsTrigger value="promotions">Khuyến mãi</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
              <TabsTrigger value="chat">Tin nhắn</TabsTrigger>
              <TabsTrigger value="add">Thêm mới</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        <Routes>
          <Route index element={
            <SellerStatusHandler>
              <SellerStats />
            </SellerStatusHandler>
          } />
          <Route path="/products" element={<SellerProducts />} />
          <Route path="/products/add" element={<SellerAddProduct />} />
          <Route path="/orders" element={
            <SellerStatusHandler>
              <SellerOrders />
            </SellerStatusHandler>
          } />
          <Route path="/promotions" element={
            <SellerStatusHandler>
              <SellerPromotions />
            </SellerStatusHandler>
          } />
          <Route path="/reviews" element={
            <SellerStatusHandler>
              <SellerReviews />
            </SellerStatusHandler>
          } />
          <Route path="/analytics" element={
            <SellerStatusHandler>
              <SellerAnalytics />
            </SellerStatusHandler>
          } />
          <Route path="/notifications" element={
            <SellerStatusHandler>
              <NotificationCenter />
            </SellerStatusHandler>
          } />
          <Route path="/chat" element={
            <SellerStatusHandler>
              <Chat />
            </SellerStatusHandler>
          } />
          <Route path="/chat/:conversationId" element={
            <SellerStatusHandler>
              <Chat />
            </SellerStatusHandler>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;
