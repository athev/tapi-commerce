import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Promotion {
  id: string;
  content: string;
  is_active: boolean;
  sort_order: number;
}

const SellerPromotionsManager = () => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newPromotion, setNewPromotion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('seller_promotions')
      .select('*')
      .eq('seller_id', user.id)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setPromotions(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newPromotion.trim() || !user?.id) return;

    const { error } = await supabase
      .from('seller_promotions')
      .insert({
        seller_id: user.id,
        content: newPromotion,
        sort_order: promotions.length
      });

    if (error) {
      toast.error("Không thể thêm khuyến mãi");
    } else {
      toast.success("Đã thêm khuyến mãi");
      setNewPromotion("");
      fetchPromotions();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('seller_promotions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Không thể xóa khuyến mãi");
    } else {
      toast.success("Đã xóa khuyến mãi");
      fetchPromotions();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('seller_promotions')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Không thể cập nhật trạng thái");
    } else {
      toast.success("Đã cập nhật trạng thái");
      fetchPromotions();
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý khuyến mãi đặc biệt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new promotion */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Nhập nội dung khuyến mãi (ví dụ: - Giảm giá 10% cho đơn hàng đầu tiên)"
            value={newPromotion}
            onChange={(e) => setNewPromotion(e.target.value)}
            className="flex-1"
            rows={2}
          />
          <Button onClick={handleAdd} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Thêm
          </Button>
        </div>

        {/* List promotions */}
        <div className="space-y-2">
          {promotions.map((promo) => (
            <div key={promo.id} className="flex items-start gap-2 p-3 border rounded">
              <GripVertical className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
              <div className="flex-1 text-sm">{promo.content}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(promo.id, promo.is_active)}
              >
                {promo.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(promo.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerPromotionsManager;
