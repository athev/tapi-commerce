import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid3x3, Heart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import CategoryModal from "@/components/home/CategoryModal";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { favoriteCount } = useFavorites();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Hide on product detail page
  if (location.pathname.startsWith('/product/')) {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/', isButton: false },
    { icon: Grid3x3, label: 'Danh mục', path: '', isButton: true },
    { icon: Heart, label: 'Yêu thích', path: '/favorites', isButton: false },
    { icon: User, label: 'Tôi', path: user ? '/my-purchases' : '/login', isButton: false }
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-[100] shadow-2xl">
        <div className="flex items-center justify-around h-14 md:h-16 pb-safe">
          {navItems.map((item, index) => {
            const isActive = item.isButton 
              ? showCategoryModal 
              : location.pathname === item.path;
            const Icon = item.icon;
            
            if (item.isButton) {
              return (
                <button
                  key={index}
                  onClick={() => setShowCategoryModal(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 md:gap-1 flex-1 h-full relative transition-all min-w-[60px]',
                    isActive && 'text-primary'
                  )}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 md:w-12 h-0.5 md:h-1 bg-primary rounded-b-full" />
                  )}
                  
                  <div className="relative">
                    <Icon className={cn(
                      'h-5 w-5 md:h-6 md:w-6 transition-all',
                      isActive && 'scale-110'
                    )} />
                  </div>
                  
                  <span className={cn(
                    'text-[9px] md:text-[10px] font-medium transition-all',
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 md:gap-1 flex-1 h-full relative transition-all min-w-[60px]',
                  isActive && 'text-primary'
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 md:w-12 h-0.5 md:h-1 bg-primary rounded-b-full" />
                )}
                
                <div className="relative">
                  <Icon className={cn(
                    'h-5 w-5 md:h-6 md:w-6 transition-all',
                    isActive && 'scale-110'
                  )} />
                  
                  {item.label === 'Yêu thích' && favoriteCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[9px] md:text-[10px] font-bold rounded-full h-4 md:h-5 min-w-[1rem] md:min-w-[1.25rem] px-0.5 md:px-1 flex items-center justify-center shadow-md">
                      {favoriteCount}
                    </span>
                  )}
                </div>
                
                <span className={cn(
                  'text-[9px] md:text-[10px] font-medium transition-all',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <CategoryModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
      />
    </>
  );
};

export default MobileBottomNav;
