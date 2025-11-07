
import { Routes, Route } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SellerStats from "@/components/seller/SellerStats";
import SellerProducts from "@/components/seller/SellerProducts";
import SellerOrders from "@/components/seller/SellerOrders";
import SellerWallet from "@/components/seller/SellerWallet";
import SellerAddProduct from "@/components/seller/SellerAddProduct";
import SellerPromotionsManager from "@/components/seller/SellerPromotionsManager";
import SellerPoliciesManager from "@/components/seller/SellerPoliciesManager";
import SellerShopInfoEditor from "@/components/seller/SellerShopInfoEditor";
import EditProduct from "@/pages/EditProduct";
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
      
      <Route path="/shop-settings" element={
        <Tabs value="shop-settings" className="space-y-6">
          <SellerTabsNavigation />
          <TabsContent value="shop-settings" className="space-y-6">
            <div className="space-y-6">
              <SellerShopInfoEditor />
              <SellerPromotionsManager />
              <SellerPoliciesManager />
            </div>
          </TabsContent>
        </Tabs>
      } />
      
      <Route path="/edit-product/:productId" element={
        <Tabs value="products" className="space-y-6">
          <SellerTabsNavigation />
          <TabsContent value="products" className="space-y-6">
            <EditProduct />
          </TabsContent>
        </Tabs>
      } />
    </Routes>
  );
};

export default SellerDashboardContent;
