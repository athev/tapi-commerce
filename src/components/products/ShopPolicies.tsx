import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ShopPoliciesProps {
  sellerId: string;
  shopName: string;
}

interface Policy {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export const ShopPolicies = ({ sellerId, shopName }: ShopPoliciesProps) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      const { data, error } = await supabase
        .from('seller_policies')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setPolicies(data);
      }
      setLoading(false);
    };

    fetchPolicies();
  }, [sellerId]);

  if (loading || policies.length === 0) return null;

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : <Icons.Shield className="h-6 w-6" />;
  };

  return (
    <Card>
      <CardHeader className="bg-black text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-full p-1">
            <Icons.Shield className="h-4 w-4 text-black" />
          </div>
          <h3 className="font-bold text-base">Chính sách shop {shopName}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {policies.map((policy) => (
          <div key={policy.id} className="flex items-start gap-3">
            <div className="text-gray-600 shrink-0">
              {getIcon(policy.icon)}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{policy.title}</h4>
              <p className="text-xs text-gray-600">{policy.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
