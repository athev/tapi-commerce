
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSignUp = () => {
  // Enhanced sign up with email and password with better error handling
  const signUp = async (email: string, password: string, fullName: string) => {
    console.log("Attempting to sign up user:", email);
    
    // First check if we're online
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

    let retries = 0;
    const maxRetries = 2;
    
    // Use a retry mechanism for network issues
    const attemptSignUp = async (): Promise<{ error: any, success: boolean }> => {
      try {
        // First try to create the auth user
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
            },
          }
        });
        
        if (error) {
          console.error("Auth signup error:", error);
          
          // Check if it's a network error that we should retry
          if ((error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) && retries < maxRetries) {
            retries++;
            console.log(`Network error during signup, retrying (${retries}/${maxRetries})...`);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return attemptSignUp();
          }
          
          throw error;
        }
        
        console.log("Auth signup successful, user data:", data.user?.id);
        
        // Create profile with role = end-user
        if (data.user) {
          try {
            console.log("Creating user profile for:", data.user.id);
            
            const { error: profileError } = await supabase.from('profiles').insert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: 'end-user',
            });
            
            if (profileError) {
              console.error('Profile creation error:', profileError);
              // Even if profile creation fails, we still created the auth user
              toast.success("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.");
              return { error: null, success: true };
            }
            
            console.log("Profile created successfully");
            
            return { error: null, success: true };
          } catch (profileError) {
            console.error('Profile creation exception:', profileError);
            // Still count as success since auth user was created
            return { error: null, success: true };
          }
        }
        
        return { error: null, success: true };
      } catch (error) {
        console.error('Sign up error:', error);
        
        // Enhanced error handling for network issues with more specific messages
        let errorMessage = "Đã xảy ra lỗi trong quá trình đăng ký";
        let errorCode = "unknown_error";
        
        if (!navigator.onLine || error.message?.includes('fetch') || error.message?.includes('network')) {
          errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.";
          errorCode = "network_error";
        } else if (error.message?.includes('already')) {
          errorMessage = "Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập.";
          errorCode = "email_in_use";
        } else if (error.message?.includes('password')) {
          errorMessage = "Mật khẩu không đạt yêu cầu. Vui lòng sử dụng mật khẩu mạnh hơn.";
          errorCode = "weak_password";
        }
        
        // Add additional properties to the error object
        error.code = errorCode;
        error.message = errorMessage;
        
        return { error, success: false };
      }
    };
    
    return attemptSignUp();
  };

  return { signUp };
};
