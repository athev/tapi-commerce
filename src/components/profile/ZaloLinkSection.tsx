import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Link2, Unlink, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

const ZaloLinkSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [zaloId, setZaloId] = useState('');
  const [currentZaloId, setCurrentZaloId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch current Zalo ID on mount
  useEffect(() => {
    const fetchZaloId = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('zalo_user_id')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setCurrentZaloId(data?.zalo_user_id || null);
        setZaloId(data?.zalo_user_id || '');
      } catch (error) {
        console.error('Error fetching Zalo ID:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchZaloId();
  }, [user?.id]);

  const handleLink = async () => {
    if (!user?.id || !zaloId.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ zalo_user_id: zaloId.trim() })
        .eq('id', user.id);

      if (error) throw error;

      setCurrentZaloId(zaloId.trim());
      toast({
        title: "Liên kết thành công",
        description: "Bạn sẽ nhận thông báo qua Zalo từ bây giờ",
      });
    } catch (error: any) {
      console.error('Error linking Zalo:', error);
      toast({
        title: "Lỗi",
        description: "Không thể liên kết Zalo. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ zalo_user_id: null })
        .eq('id', user.id);

      if (error) throw error;

      setCurrentZaloId(null);
      setZaloId('');
      toast({
        title: "Đã hủy liên kết",
        description: "Bạn sẽ không nhận thông báo qua Zalo nữa",
      });
    } catch (error: any) {
      console.error('Error unlinking Zalo:', error);
      toast({
        title: "Lỗi",
        description: "Không thể hủy liên kết. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-500/10">
            <MessageCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Thông báo Zalo</CardTitle>
            <CardDescription>
              Nhận thông báo đơn hàng, tin nhắn qua Zalo
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentZaloId ? (
          // Already linked
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Đã liên kết Zalo
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  ID: {currentZaloId}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleUnlink}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Hủy liên kết
            </Button>
          </div>
        ) : (
          // Not linked yet
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zalo-id">Zalo User ID</Label>
              <Input
                id="zalo-id"
                placeholder="Nhập Zalo User ID của bạn"
                value={zaloId}
                onChange={(e) => setZaloId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Để lấy Zalo User ID, bạn cần nhắn tin cho bot Zalo của TAPI
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                📱 Hướng dẫn lấy Zalo User ID:
              </p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Mở Zalo trên điện thoại</li>
                <li>Tìm kiếm OA "<strong>TAPI Store</strong>"</li>
                <li>Nhắn tin bất kỳ (VD: "xin chào")</li>
                <li>Bot tự động gửi lại Zalo User ID</li>
                <li>Copy ID và dán vào ô trên</li>
              </ol>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                💡 Chưa tìm thấy? Liên hệ hỗ trợ qua chat
              </p>
            </div>
            
            <Button 
              onClick={handleLink}
              disabled={isLoading || !zaloId.trim()}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Liên kết Zalo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZaloLinkSection;
