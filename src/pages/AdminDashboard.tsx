import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ManualPaymentOrders from "@/components/admin/ManualPaymentOrders";
import CassoDebugTester from "@/components/admin/CassoDebugTester";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("manual-payments");
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="manual-payments">Thanh toán thủ công</TabsTrigger>
            <TabsTrigger value="casso-debug">Casso Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="manual-payments">
            <ManualPaymentOrders />
          </TabsContent>
          
          <TabsContent value="casso-debug">
            <CassoDebugTester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
