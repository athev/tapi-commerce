
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterChoice from "./pages/RegisterChoice";
import RegisterUser from "./pages/RegisterUser";
import RegisterSeller from "./pages/RegisterSeller";
import MyAccount from "./pages/MyAccount";
import MyPurchases from "./pages/MyPurchases";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";
import Chat from "./pages/Chat";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-choice" element={<RegisterChoice />} />
            <Route path="/register-user" element={<RegisterUser />} />
            <Route path="/register-seller" element={<RegisterSeller />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            
            {/* Temporarily remove protection for development */}
            <Route path="/seller/*" element={<SellerDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
