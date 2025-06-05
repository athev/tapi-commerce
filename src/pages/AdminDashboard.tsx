
import { useAuth } from "@/context/AuthContext";
import AdminStats from "@/components/admin/AdminStats";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminSellerApplications from "@/components/admin/AdminSellerApplications";
import ManualPaymentOrders from "@/components/admin/ManualPaymentOrders";
import ProcessOldOrdersButton from "@/components/admin/ProcessOldOrdersButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, profile } = useAuth();

  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <ProcessOldOrdersButton />
      </div>
      
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="stats">Thống kê</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="sellers">Đăng ký bán</TabsTrigger>
          <TabsTrigger value="manual-payments">Thanh toán thủ công</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>

        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrders />
        </TabsContent>

        <TabsContent value="sellers">
          <AdminSellerApplications />
        </TabsContent>

        <TabsContent value="manual-payments">
          <ManualPaymentOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
