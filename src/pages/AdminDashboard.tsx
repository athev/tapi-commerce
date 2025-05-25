
import { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminStats from "@/components/admin/AdminStats";
import AdminSellerApplications from "@/components/admin/AdminSellerApplications";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
          <p className="text-gray-500">Xin chào, {profile?.full_name}</p>
        </div>
        
        <Tabs 
          value={
            currentPath.includes('/admin/users') ? 'users' :
            currentPath.includes('/admin/orders') ? 'orders' :
            currentPath.includes('/admin/seller-applications') ? 'seller-applications' :
            currentPath.includes('/admin/stats') ? 'stats' : 'products'
          }
          onValueChange={(value) => {
            if (value === 'products') navigate('/admin/products');
            else if (value === 'orders') navigate('/admin/orders');
            else if (value === 'users') navigate('/admin/users');
            else if (value === 'seller-applications') navigate('/admin/seller-applications');
            else if (value === 'stats') navigate('/admin/stats');
          }}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="products">Sản phẩm</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="seller-applications">Đơn đăng ký</TabsTrigger>
            <TabsTrigger value="stats">Thống kê</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/seller-applications" element={<AdminSellerApplications />} />
          <Route path="/stats" element={<AdminStats />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
