
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ManualPaymentOrders from "@/components/admin/ManualPaymentOrders";
import AdminStats from "@/components/admin/AdminStats";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminSellerApplications from "@/components/admin/AdminSellerApplications";
import { AdminWalletBackfill } from "@/components/admin/AdminWalletBackfill";
import AdminWithdrawals from "@/components/admin/AdminWithdrawals";
import { AdminBrandingSettings } from "@/components/admin/settings/AdminBrandingSettings";
import { AdminSEOSettings } from "@/components/admin/settings/AdminSEOSettings";
import { AdminCategoryManager } from "@/components/admin/settings/AdminCategoryManager";
import { AdminFooterEditor } from "@/components/admin/settings/AdminFooterEditor";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const { user, session, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      toast.error("Bạn cần đăng nhập để xem trang này");
      navigate('/login');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <span className="font-bold">Admin Dashboard</span>
            <button onClick={() => supabase.auth.signOut()} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 gap-1">
            <TabsTrigger value="stats">Thống kê</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="products">Sản phẩm</TabsTrigger>
            <TabsTrigger value="categories">Danh mục</TabsTrigger>
            <TabsTrigger value="branding">Thương hiệu</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="manual-payments">TT thủ công</TabsTrigger>
            <TabsTrigger value="withdrawals">Rút tiền</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="categories">
            <AdminCategoryManager />
          </TabsContent>

          <TabsContent value="branding">
            <AdminBrandingSettings />
          </TabsContent>

          <TabsContent value="seo">
            <AdminSEOSettings />
          </TabsContent>

          <TabsContent value="footer">
            <AdminFooterEditor />
          </TabsContent>
          
          <TabsContent value="manual-payments">
            <ManualPaymentOrders />
          </TabsContent>

          <TabsContent value="withdrawals">
            <AdminWithdrawals />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
