
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const useRegisterFormValidation = () => {
  const { toast: toastNotification } = useToast();

  const validateForm = (
    password: string,
    confirmPassword: string,
    acceptTerms: boolean
  ): ValidationResult => {
    if (password !== confirmPassword) {
      toastNotification({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      return { isValid: false };
    }
    
    if (!acceptTerms) {
      toastNotification({
        title: "Lỗi",
        description: "Vui lòng chấp nhận điều khoản sử dụng.",
        variant: "destructive",
      });
      return { isValid: false };
    }
    
    if (password.length < 6) {
      toastNotification({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return { isValid: false };
    }

    return { isValid: true };
  };

  return { validateForm };
};
