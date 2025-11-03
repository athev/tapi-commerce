import { Link, useLocation } from "react-router-dom";
import { Home, Grid3x3, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 lg:hidden safe-area-pb">
      <nav className="flex items-center justify-around h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Trang chủ</span>
        </Link>

        <Link
          to="/?view=categories"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            location.search.includes("view=categories")
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <Grid3x3 className="h-5 w-5 mb-1" />
          <span className="text-xs">Danh mục</span>
        </Link>

        <Link
          to="/cart"
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            isActive("/cart") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <ShoppingCart className="h-5 w-5 mb-1" />
          <span className="text-xs">Giỏ hàng</span>
          <span className="absolute top-2 right-1/2 translate-x-3 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            0
          </span>
        </Link>

        <Link
          to={user ? "/my-purchases" : "/login"}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive("/my-purchases") || isActive("/login")
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs">Tôi</span>
        </Link>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
