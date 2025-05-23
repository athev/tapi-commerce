
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
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast: toastNotification } = useToast();

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
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
      toastNotification({
        title: "Đăng nhập thất bại",
        description: error.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
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
      
      if (error) throw error;
      
      // Create profile with role = end-user
      if (data.user) {
        try {
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
          
          toastNotification({
            title: "Đăng ký thành công",
            description: "Vui lòng kiểm tra email để xác nhận tài khoản",
          });
          
          return { error: null, success: true };
        } catch (profileError) {
          console.error('Profile creation exception:', profileError);
          // Still count as success since auth user was created
          toast.success("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.");
          return { error: null, success: true };
        }
      }
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Provide more specific error messages based on common issues
      let errorMessage = "Đã xảy ra lỗi trong quá trình đăng ký";
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.";
      } else if (error.message?.includes('already')) {
        errorMessage = "Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập.";
      } else if (error.message?.includes('password')) {
        errorMessage = "Mật khẩu không đạt yêu cầu. Vui lòng sử dụng mật khẩu mạnh hơn.";
      }
      
      toastNotification({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Also use sonner toast for more visible error message
      toast.error(errorMessage);
      
      return { error, success: false };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
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
    if (user) {
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};
