
import { Routes, Route } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SellerStats from "@/components/seller/SellerStats";
import SellerProducts from "@/components/seller/SellerProducts";
import SellerOrders from "@/components/seller/SellerOrders";
import SellerWallet from "@/components/seller/SellerWallet";
import SellerAddProduct from "@/components/seller/SellerAddProduct";
import SellerTabsNavigation from "./SellerTabsNavigation";

interface SellerDashboardContentProps {
  currentTab: string;
}

const SellerDashboardContent = ({ currentTab }: SellerDashboardContentProps) => {
  return (
    <Routes>
      <Route path="/" element={
        <Tabs value={currentTab} className="space-y-6">
          <SellerTabsNavigation />
          <TabsContent value="overview" className="space-y-6">
            <SellerStats />
          </TabsContent>
        </Tabs>
      } />
      
      <Route path="/products" element={
        <Tabs value="products" className="space-y-6">
          <SellerTabsNavigation />
          <TabsContent value="products" className="space-y-6">
            <SellerProducts />
          </TabsContent>
        </Tabs>
      } />
      
      <Route path="/orders" element={
        <Tabs value="orders" className="space-y-6">
          <SellerTabsNavigation />
          <TabsContent value="orders" className="space-y-6">
            <SellerOrders />
          </TabsContent>
        </Tabs>
      } />

      <Route path="/wallet" element={
        <Tabs value="wallet" className="space-y-6">
          <SellerTabsNavigation />
          <TabsContent value="wallet" className="space-y-6">
            <SellerWallet />
          </TabsContent>
        </Tabs>
      } />
      
      <Route path="/add-product" element={
        <Tabs value="add-product" className="space-y-6">
          <SellerTabsNavigation />
          <TabsContent value="add-product" className="space-y-6">
            <SellerAddProduct />
          </TabsContent>
        </Tabs>
      } />
    </Routes>
  );
};

export default SellerDashboardContent;
