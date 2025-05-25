
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

const SellerDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kênh người bán</h1>
            <p className="text-gray-500">Xin chào, {profile?.full_name}</p>
          </div>
          
          <Button 
            onClick={() => navigate('/seller/products/add')}
            className="bg-green-600 hover:bg-green-700"
          >
            Tạo sản phẩm mới
          </Button>
        </div>
        
        <Tabs 
          value={
            currentPath.includes('/seller/orders') ? 'orders' : 
            currentPath.includes('/seller/products/add') ? 'add' : 'products'
          }
          onValueChange={(value) => {
            if (value === 'orders') navigate('/seller/orders');
            else if (value === 'products') navigate('/seller/products');
            else if (value === 'add') navigate('/seller/products/add');
          }}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="products">Sản phẩm của tôi</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="add">Thêm sản phẩm</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Routes>
          <Route index element={<SellerProducts />} />
          <Route path="/products" element={<SellerProducts />} />
          <Route path="/products/add" element={<SellerAddProduct />} />
          <Route path="/orders" element={<SellerOrders />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;
