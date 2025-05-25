
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

export const useAuthOperations = (fetchProfile: (userId: string) => Promise<any>, setProfile: (profile: any) => void) => {
  const { toast: toastNotification } = useToast();

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!navigator.onLine) {
      console.error('Network error: User is offline');
      return { 
        error: { 
          message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.",
          code: "network_error" 
        } 
      };
    }

    try {
      console.log('useAuthOperations: Starting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('useAuthOperations: Sign in error:', error);
        throw error;
      }
      
      console.log('useAuthOperations: Sign in successful:', !!data.user);
      
      if (data.user) {
        console.log('useAuthOperations: Fetching user profile...');
        try {
          const userProfile = await fetchProfile(data.user.id);
          if (userProfile) {
            setProfile(userProfile);
            console.log('useAuthOperations: Profile set successfully');
          }
        } catch (profileError) {
          console.error('useAuthOperations: Profile fetch failed:', profileError);
          // Don't fail the login if profile fetch fails
        }
        
        toastNotification({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('useAuthOperations: Sign in error:', error);
      
      // Detect network errors specifically
      if (error.message?.includes('fetch') || error.message?.includes('network') || !navigator.onLine) {
        error.code = "network_error";
        error.message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.";
      }
      
      toastNotification({
        title: "Đăng nhập thất bại",
        description: error.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      if (!navigator.onLine) {
        toastNotification({
          title: "Không thể đăng xuất",
          description: "Bạn đang offline. Vui lòng kết nối internet và thử lại.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('useAuthOperations: Signing out...');
      await supabase.auth.signOut();
      setProfile(null);
      console.log('useAuthOperations: Sign out successful');
      
      toastNotification({
        title: "Đã đăng xuất",
      });
    } catch (error) {
      console.error('useAuthOperations: Error signing out:', error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return {
    signIn,
    signOut
  };
};
