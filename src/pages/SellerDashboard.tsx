
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SellerStatusHandler from "@/components/seller/SellerStatusHandler";
import SellerDashboardHeader from "@/components/seller/SellerDashboardHeader";
import SellerDashboardContent from "@/components/seller/SellerDashboardContent";

const SellerDashboard = () => {
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
        <SellerDashboardHeader />

        <SellerStatusHandler>
          <SellerDashboardContent currentTab={currentTab} />
        </SellerStatusHandler>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;
