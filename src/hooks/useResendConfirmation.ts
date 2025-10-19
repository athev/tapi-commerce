import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const useResendConfirmation = (email: string | undefined) => {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const getRedirectUrl = () => {
    const prodHosts = ['www.tapi.vn', 'tapi.vn', 'tapi-commerce.lovable.app'];
    if (prodHosts.includes(window.location.hostname)) {
      return `${window.location.origin}/`;
    }
    return 'https://www.tapi.vn/';
  };

  const resendEmail = async (): Promise<boolean> => {
    if (!email) {
      toast.error("Email không hợp lệ");
      return false;
    }

    if (!navigator.onLine) {
      toast.error("Bạn đang offline. Vui lòng kết nối internet và thử lại.");
      return false;
    }

    if (countdown > 0) {
      toast.error(`Vui lòng đợi ${countdown}s trước khi gửi lại`);
      return false;
    }

    setIsResending(true);
    setCanResend(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: getRedirectUrl()
        }
      });

      if (error) {
        console.error("Error resending confirmation email:", error);
        toast.error(error.message || "Không thể gửi lại email. Vui lòng thử lại sau.");
        setCanResend(true);
        return false;
      }

      toast.success("Email xác thực đã được gửi lại thành công!");
      setCountdown(60); // 60 seconds countdown
      return true;
    } catch (error: any) {
      console.error("Error in resendEmail:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      setCanResend(true);
      return false;
    } finally {
      setIsResending(false);
    }
  };

  return {
    resendEmail,
    isResending,
    countdown,
    canResend
  };
};

export default useResendConfirmation;
