import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Policy {
  id: string;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

const ICON_OPTIONS = [
  { value: 'Truck', label: 'Xe tải (Vận chuyển)' },
  { value: 'Gift', label: 'Quà tặng' },
  { value: 'Shield', label: 'Bảo hành/Bảo vệ' },
  { value: 'Phone', label: 'Điện thoại' },
  { value: 'Clock', label: 'Đồng hồ (Thời gian)' },
  { value: 'CheckCircle', label: 'Tích xanh (Đảm bảo)' },
  { value: 'Award', label: 'Huy chương (Chất lượng)' },
  { value: 'Zap', label: 'Tia chớp (Nhanh chóng)' }
];

const SellerPoliciesManager = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newPolicy, setNewPolicy] = useState({
    icon: 'Shield',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('seller_policies')
      .select('*')
      .eq('seller_id', user.id)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setPolicies(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newPolicy.title.trim() || !user?.id) return;

    const { error } = await supabase
      .from('seller_policies')
      .insert({
        seller_id: user.id,
        icon: newPolicy.icon,
        title: newPolicy.title,
        description: newPolicy.description,
        sort_order: policies.length
      });

    if (error) {
      toast.error("Không thể thêm chính sách");
    } else {
      toast.success("Đã thêm chính sách");
      setNewPolicy({ icon: 'Shield', title: '', description: '' });
      fetchPolicies();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('seller_policies')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Không thể xóa chính sách");
    } else {
      toast.success("Đã xóa chính sách");
      fetchPolicies();
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý chính sách shop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new policy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            value={newPolicy.icon}
            onValueChange={(value) => setNewPolicy({ ...newPolicy, icon: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Tiêu đề (VD: Miễn phí vận chuyển)"
            value={newPolicy.title}
            onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
          />
          <Input
            placeholder="Mô tả (VD: Cho đơn trên 500k)"
            value={newPolicy.description}
            onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
          />
        </div>
        <Button onClick={handleAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Thêm chính sách
        </Button>

        {/* List policies */}
        <div className="space-y-2">
          {policies.map((policy) => (
            <div key={policy.id} className="flex items-center gap-3 p-3 border rounded">
              <GripVertical className="h-5 w-5 text-gray-400 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{policy.title}</div>
                <div className="text-xs text-gray-500">{policy.description}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(policy.id)}
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

export default SellerPoliciesManager;
