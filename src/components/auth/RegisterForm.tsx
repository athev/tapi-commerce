
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import RegisterFormFields from "@/components/auth/RegisterFormFields";
import RegisterFormSubmit from "@/components/auth/RegisterFormSubmit";
import { useRegisterFormValidation } from "@/components/auth/RegisterFormValidation";

interface RegisterFormProps {
  networkError: boolean;
  handleRetry: () => void;
}

const RegisterForm = ({ networkError, handleRetry }: RegisterFormProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { validateForm } = useRegisterFormValidation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate network connection first
    if (!navigator.onLine) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
      return;
    }
    
    // Validate form data
    const { isValid } = validateForm(password, confirmPassword, acceptTerms);
    if (!isValid) return;
    
    setIsLoading(true);
    
    try {
      console.log("Starting signup attempt...");
      const { error, success } = await signUp(email, password, fullName);
      
      if (success && !error) {
        // Show success message with sonner toast for better visibility
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else if (error) {
        console.error("Signup error details:", error);
        
        if (error.code === "network_error" || error.message?.includes('network') || error.message?.includes('fetch')) {
          toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
        } else {
          toast.error(error.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.message?.includes('fetch') || error.message?.includes('network') || !navigator.onLine) {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
      } else {
        toast.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RegisterFormFields
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        acceptTerms={acceptTerms}
        setAcceptTerms={setAcceptTerms}
        isLoading={isLoading}
        networkError={networkError}
      />
      
      <RegisterFormSubmit 
        isLoading={isLoading}
        networkError={networkError}
      />
    </form>
  );
};

export default RegisterForm;
