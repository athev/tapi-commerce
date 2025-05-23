import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any, success: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isOnline: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  refreshProfile: async () => {},
  isOnline: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast: toastNotification } = useToast();

  // Enhanced network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Kết nối internet đã được khôi phục", { id: "network-status" });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Mất kết nối internet. Một số chức năng có thể không hoạt động.", { id: "network-status" });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    if (!navigator.onLine) {
      console.log("Offline mode: Cannot fetch profile");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Initialize user session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if we're online first
        if (!navigator.onLine) {
          console.log("Offline mode: Using cached session if available");
          setLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            const userProfile = await fetchProfile(newSession.user.id);
            setProfile(userProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        toastNotification({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      
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
      
      await supabase.auth.signOut();
      setProfile(null);
      toastNotification({
        title: "Đã đăng xuất",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user && navigator.onLine) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      isOnline,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
