
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Phone, MapPin, Building } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SellerApplication = Database['public']['Tables']['seller_applications']['Row'];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const AdminSellerApplications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['admin-seller-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SellerApplication[];
    }
  });

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = 
      app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingId(applicationId);
    
    try {
      const application = applications?.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // First update the application status
      const { error: appError } = await supabase
        .from('seller_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (appError) throw appError;

      // If approved, trigger will automatically:
      // 1. Insert seller role into user_roles table
      // 2. Update profiles.role for backward compatibility
      // 3. Create wallet via create_seller_wallet trigger
      if (newStatus === 'approved') {
        console.log('✅ Seller application approved - triggers will handle role and wallet creation');

        // Send notification to the user about approval
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: application.user_id,
            type: 'info',
            title: 'Đăng ký người bán được duyệt',
            message: `Chúc mừng! Đăng ký gian hàng "${application.business_name}" của bạn đã được phê duyệt. Bạn có thể bắt đầu bán hàng ngay bây giờ.`,
            is_read: false
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }
      
      toast.success(newStatus === 'approved' ? 'Đã phê duyệt đơn đăng ký' : 'Đã từ chối đơn đăng ký');
      refetch();
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Đã từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Quản lý đơn đăng ký người bán</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên gian hàng hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredApplications && filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Building className="h-5 w-5 text-gray-500" />
                          {application.business_name}
                        </h3>
                        <p className="text-gray-600 mt-1">{application.business_description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(application.status)}
                        <span className="text-sm text-gray-500">
                          {formatDate(application.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{application.phone}</span>
                      </div>
                      {application.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{application.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {application.status === 'pending' && (
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button
                        onClick={() => handleUpdateStatus(application.id, 'approved')}
                        disabled={processingId === application.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === application.id ? 'Đang xử lý...' : 'Phê duyệt'}
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                        disabled={processingId === application.id}
                        variant="destructive"
                      >
                        {processingId === application.id ? 'Đang xử lý...' : 'Từ chối'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Không tìm thấy đơn đăng ký</h3>
          <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}
    </div>
  );
};

export default AdminSellerApplications;
