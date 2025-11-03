import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface SpecialPromotionsProps {
  sellerId: string;
}

interface Promotion {
  id: string;
  content: string;
  sort_order: number;
}

export const SpecialPromotions = ({ sellerId }: SpecialPromotionsProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      const { data, error } = await supabase
        .from('seller_promotions')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setPromotions(data);
      }
      setLoading(false);
    };

    fetchPromotions();
  }, [sellerId]);

  if (loading || promotions.length === 0) return null;

  return (
    <Card className="bg-red-600 border-red-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-white rounded-full p-2 shrink-0">
            <Gift className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-2">
              Khuyến mãi đặc biệt
            </h3>
            <ul className="space-y-1.5 text-white text-sm">
              {promotions.map((promo) => (
                <li key={promo.id} className="leading-relaxed">
                  {promo.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
