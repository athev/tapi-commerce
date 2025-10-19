import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle2, Info, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import useResendConfirmation from "@/hooks/useResendConfirmation";

const VerifyEmailPrompt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const fromLogin = location.state?.fromLogin;
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [resendError, setResendError] = useState("");

  const { resendEmail, isResending, countdown, canResend } = useResendConfirmation(email);

  useEffect(() => {
    document.title = "Xác thực email | DigitalMarket";
    
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleResend = async () => {
    const success = await resendEmail();
    if (success) {
      setShowSuccessAlert(true);
      setResendError("");
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } else {
      setResendError("Không thể gửi lại email. Vui lòng kiểm tra kết nối internet và thử lại sau.");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <CardTitle className="text-2xl">
                {fromLogin ? "Tài khoản chưa được xác thực" : "Kiểm tra email của bạn"}
              </CardTitle>
              
              <CardDescription className="text-base">
                {fromLogin ? (
                  <>
                    Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email và click vào link xác thực để kích hoạt tài khoản.
                  </>
                ) : (
                  <>
                    Chúng tôi đã gửi một email xác thực đến <strong className="text-foreground">{email}</strong>
                  </>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Hướng dẫn xác thực email</AlertTitle>
                <AlertDescription className="text-blue-800">
                  <ol className="list-decimal ml-4 space-y-1 mt-2 text-sm">
                    <li>Mở email từ DigitalMarket (kiểm tra cả thư mục spam/junk)</li>
                    <li>Click vào nút "Xác thực tài khoản" trong email</li>
                    <li>Bạn sẽ được tự động chuyển về trang chủ và đăng nhập</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {showSuccessAlert && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Email xác thực đã được gửi lại thành công!
                  </AlertDescription>
                </Alert>
              )}

              {resendError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resendError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">

                <Button
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="w-full"
                  variant="outline"
                >
                  {isResending ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      Đang gửi...
                    </>
                  ) : countdown > 0 ? (
                    `Gửi lại sau ${countdown}s`
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Gửi lại email xác thực
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  asChild
                >
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay về đăng nhập
                  </Link>
                </Button>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Không nhận được email?
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Kiểm tra thư mục spam/junk mail</li>
                  <li>• Đảm bảo email <strong className="text-foreground">{email}</strong> chính xác</li>
                  <li>• Email có thể mất 5-10 phút để gửi đến</li>
                  <li>• Liên hệ hỗ trợ nếu vẫn không nhận được sau 15 phút</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmailPrompt;
