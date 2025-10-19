
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSignUp = () => {
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!navigator.onLine) {
      console.error('Network error: User is offline');
      return { 
        error: { 
          message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.",
          code: "network_error" 
        },
        success: false
      };
    }

    // Helper function to get the correct redirect URL
    const getRedirectUrl = () => {
      const prodHosts = ['www.tapi.vn', 'tapi.vn', 'tapi-commerce.lovable.app'];
      // If already on production, use current origin
      if (prodHosts.includes(window.location.hostname)) {
        return `${window.location.origin}/`;
      }
      // If on localhost or other domain, redirect to production
      return 'https://www.tapi.vn/';
    };

    try {
      console.log('Starting signup process...');
      
      // Step 1: Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('Signup successful:', authData.user.id);

      // The trigger will automatically create the profile, but let's verify it exists
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (!profileError && profileData) {
            console.log('Profile created successfully:', profileData);
            break;
          }
          
          if (retries === maxRetries - 1) {
            // Last retry - manually create profile if trigger failed
            console.log('Creating profile manually as fallback...');
            const { error: insertError } = await supabase.from('profiles').insert({
              id: authData.user.id,
              email: authData.user.email!,
              full_name: fullName,
              role: 'end-user'
            });
            
            if (insertError) {
              console.error('Manual profile creation failed:', insertError);
            }
          }
          
          retries++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        } catch (error) {
          console.error(`Profile verification attempt ${retries + 1} failed:`, error);
          retries++;
        }
      }

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      return { error: null, success: true };
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        error.message = "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.";
      } else if (error.message?.includes('fetch') || error.message?.includes('network') || !navigator.onLine) {
        error.code = "network_error";
        error.message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.";
      } else if (!error.message) {
        error.message = "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.";
      }
      
      toast.error(error.message);
      return { error, success: false };
    }
  };

  return { signUp };
};
