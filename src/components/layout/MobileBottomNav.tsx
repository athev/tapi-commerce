import { Link, useLocation } from "react-router-dom";
import { Home, Grid3x3, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: Grid3x3, label: 'Danh mục', path: '/?view=categories' },
    { icon: ShoppingCart, label: 'Giỏ hàng', path: '/cart' },
    { icon: User, label: 'Tôi', path: user ? '/my-purchases' : '/login' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb z-50 shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path.includes('view=categories') && location.search.includes('view=categories'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all',
                isActive && 'text-primary'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
              
              <div className="relative">
                <Icon className={cn(
                  'h-6 w-6 transition-all',
                  isActive && 'scale-110'
                )} />
                
                {/* Badge for cart */}
                {item.label === 'Giỏ hàng' && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-white text-[10px] font-bold rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                    3
                  </span>
                )}
              </div>
              
              <span className={cn(
                'text-[10px] font-medium transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
