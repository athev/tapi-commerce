import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminWithdrawals from "@/components/admin/AdminWithdrawals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountantDashboard = () => {
  useEffect(() => {
    document.title = "Dashboard Kế toán | DigitalMarket";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Kế toán</h1>
          <p className="text-muted-foreground">Quản lý xác nhận chuyển tiền</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lệnh rút tiền</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminWithdrawals />
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default AccountantDashboard;
