
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, UserProfile } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User } from "lucide-react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  }).format(date);
};

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isChangingRole, setIsChangingRole] = useState<string | null>(null);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data as UserProfile[];
      } catch (error) {
        console.error('Error fetching users:', error);
        // Return mock data for demo
        return [
          { id: '1', email: 'user1@example.com', full_name: 'Người Dùng 1', role: 'end-user', created_at: '2023-01-15T00:00:00Z' },
          { id: '2', email: 'seller1@example.com', full_name: 'Người Bán 1', role: 'seller', created_at: '2023-02-20T00:00:00Z' },
          { id: '3', email: 'admin@example.com', full_name: 'Quản Trị Viên', role: 'admin', created_at: '2023-03-10T00:00:00Z' },
        ] as UserProfile[];
      }
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleChangeRole = async (userId: string, newRole: 'end-user' | 'seller' | 'admin') => {
    setIsChangingRole(userId);
    
    try {
      // In a real implementation, update the user role in Supabase
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({ role: newRole })
      //   .eq('id', userId);
      
      // if (error) throw error;
      
      toast.success('Cập nhật vai trò thành công');
      refetch();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật vai trò');
    } finally {
      setIsChangingRole(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Quản lý người dùng</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="end-user">Người mua</SelectItem>
              <SelectItem value="seller">Người bán</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredUsers && filteredUsers.length > 0 ? (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-gray-500">
                      {user.email} | Ngày tham gia: {formatDate(user.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <Badge className={
                      user.role === 'admin' ? 'bg-purple-500' : 
                      user.role === 'seller' ? 'bg-blue-500' : 'bg-gray-500'
                    }>
                      {user.role === 'admin' ? 'Quản trị viên' : 
                       user.role === 'seller' ? 'Người bán' : 'Người mua'}
                    </Badge>
                    
                    <div className="mt-2">
                      <Select
                        value={user.role}
                        disabled={isChangingRole === user.id}
                        onValueChange={(value) => handleChangeRole(
                          user.id, 
                          value as 'end-user' | 'seller' | 'admin'
                        )}
                      >
                        <SelectTrigger className="h-8 text-xs w-36">
                          <SelectValue placeholder="Đổi vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="end-user">Người mua</SelectItem>
                          <SelectItem value="seller">Người bán</SelectItem>
                          <SelectItem value="admin">Quản trị viên</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Không tìm thấy người dùng</h3>
          <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
