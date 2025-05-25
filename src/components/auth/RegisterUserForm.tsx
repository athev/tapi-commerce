
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import RegisterFormFields from "@/components/auth/RegisterFormFields";
import RegisterUserFormSubmit from "@/components/auth/RegisterUserFormSubmit";
import { useRegisterFormValidation } from "@/components/auth/RegisterFormValidation";

interface RegisterUserFormProps {
  networkError: boolean;
  handleRetry: () => void;
  userType: "end-user";
}

const RegisterUserForm = ({ networkError, handleRetry, userType }: RegisterUserFormProps) => {
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
    
    if (!navigator.onLine) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
      return;
    }
    
    const { isValid } = validateForm(password, confirmPassword, acceptTerms);
    if (!isValid) return;
    
    setIsLoading(true);
    
    try {
      console.log("Starting user signup attempt...");
      const { error, success } = await signUp(email, password, fullName);
      
      if (success && !error) {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        
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
      
      <RegisterUserFormSubmit 
        isLoading={isLoading}
        networkError={networkError}
      />
    </form>
  );
};

export default RegisterUserForm;
