import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Lock, Shield, Clock, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
}

const LoginRequiredModal = ({ isOpen, onClose, productTitle }: LoginRequiredModalProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login', { state: { from: window.location.pathname } });
  };

  const handleRegister = () => {
    navigate('/register-choice', { state: { from: window.location.pathname } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            ĐĂNG NHẬP ĐỂ NHẬN QUÀ TẶNG!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Gift Box Visual */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center animate-bounce">
              <Gift className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Đăng nhập ngay để mua <span className="font-semibold text-foreground">{productTitle}</span> và nhận:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Gift className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-semibold">Canva Pro 1 tháng</span> miễn phí
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm">Bảo mật thông tin mua hàng 100%</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm">Theo dõi đơn hàng dễ dàng</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Headphones className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <p className="text-sm">Hỗ trợ khách hàng 24/7</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Lock className="h-5 w-5 mr-2" />
              Đăng nhập ngay
            </Button>
            
            <Button 
              onClick={handleRegister}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              Đăng ký tài khoản mới
            </Button>
          </div>

          {/* Urgency Message */}
          <p className="text-center text-xs text-muted-foreground">
            🔥 <span className="font-semibold text-destructive">Chương trình có giới hạn</span> - Nhanh tay đăng ký!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRequiredModal;
