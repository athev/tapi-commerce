import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SellerDashboardHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sellerSlug, setSellerSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerSlug = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', user.id)
        .single();
      
      if (data?.slug) {
        setSellerSlug(data.slug);
      }
    };

    fetchSellerSlug();
  }, [user?.id]);

  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Người bán</h1>
        <p className="text-gray-600">Quản lý sản phẩm và đơn hàng của bạn</p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => navigate(`/shop/${sellerSlug || user?.id}`)}
      >
        <Store className="h-4 w-4 mr-2" />
        Xem gian hàng
      </Button>
    </div>
  );
};

export default SellerDashboardHeader;
