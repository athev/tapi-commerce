
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthOperations = (fetchProfile: (userId: string) => Promise<any>, setProfile: (profile: any) => void) => {
  const { toast: toastNotification } = useToast();

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!navigator.onLine) {
      console.error('useAuthOperations: Network error - User is offline');
      return { 
        error: { 
          message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.",
          code: "network_error" 
        } 
      };
    }

    try {
      console.log('useAuthOperations: Starting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('useAuthOperations: Sign in error:', error);
        throw error;
      }
      
      // Check if email is verified
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('useAuthOperations: Email not verified');
        
        // Sign out the user immediately
        await supabase.auth.signOut();
        
        return { 
          error: { 
            message: "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email để kích hoạt tài khoản.",
            code: "email_not_confirmed",
            email: email 
          } as any
        };
      }
      
      console.log('useAuthOperations: Sign in successful for user:', data.user?.id);
      
      // The onAuthStateChange listener will handle profile fetching
      // Don't fetch profile here to avoid race conditions
      
      toastNotification({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });
      
      return { error: null };
    } catch (error: any) {
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
      console.log('useAuthOperations: Starting sign out process...');
      
      if (!navigator.onLine) {
        console.log('useAuthOperations: User is offline, cannot sign out');
        toastNotification({
          title: "Không thể đăng xuất",
          description: "Bạn đang offline. Vui lòng kết nối internet và thử lại.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('useAuthOperations: Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useAuthOperations: Sign out error:', error);
        throw error;
      }
      
      console.log('useAuthOperations: Sign out successful');
      
      // Don't show success toast here, let the auth state change handle UI updates
      // The SIGNED_OUT event will clear all state
      
    } catch (error: any) {
      console.error('useAuthOperations: Error signing out:', error);
      
      // Even if there's an error, try to clear local state
      setProfile(null);
      
      toastNotification({
        title: "Có lỗi xảy ra khi đăng xuất",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  return {
    signIn,
    signOut
  };
};
