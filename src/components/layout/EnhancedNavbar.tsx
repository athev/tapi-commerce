import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, ShoppingCart, MessageCircle, LogOut, Settings, User, Bell, Package, Home, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationDropdown } from "./NotificationDropdown";
import SearchBar from "./SearchBar";

const EnhancedNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: roles } = useUserRoles();
  
  const hasSellerRole = roles?.includes('seller' as any) || roles?.includes('admin' as any);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm overflow-x-clip">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground hidden sm:block">
        <div className="container mx-auto px-4">
          <div className="flex h-9 items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span>Kênh người bán</span>
              <span>Trở thành người bán</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Hỗ trợ</span>
              <span>Tiếng Việt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between min-w-0">
            {/* Left Side - Menu + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-medium flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Trang chủ
                    </Link>
                    
                    {user && (
                      <>
                        <Link to="/chat" onClick={() => setIsOpen(false)} className="text-sm font-medium flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>Tin nhắn</span>
                          <span className="ml-auto bg-[hsl(var(--success-bg))] text-[hsl(var(--success-text))] text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                            2
                          </span>
                        </Link>
                        
                        <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-sm font-medium flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <span>Thông báo</span>
                          <span className="ml-auto h-2 w-2 bg-destructive rounded-full" />
                        </Link>
                      </>
                    )}
                    
                    <Link to="/my-purchases" onClick={() => setIsOpen(false)} className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Đơn hàng
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
              
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm md:text-lg">SP</span>
                </div>
                <span className="font-bold text-lg md:text-xl text-foreground hidden md:inline-block">
                  Sàn Phẩm Số
                </span>
              </Link>
            </div>

            {/* Center - Search Bar (Desktop only) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <SearchBar />
            </div>

            {/* Right Side - Notifications + Search (Mobile) + Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {user ? (
                <>
                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* Mobile Search Button - only show on mobile */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 sm:h-10 sm:w-10 md:hidden"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full p-0">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">Tài khoản của bạn</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link to="/my-purchases">
                            <User className="mr-2 h-4 w-4" />
                            <span>Đơn hàng của tôi</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={hasSellerRole ? "/seller" : "/seller-apply"}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Bán hàng</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Mobile Search Button for logged out users */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 sm:h-10 sm:w-10 md:hidden"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-4 text-xs sm:text-sm" asChild>
                      <Link to="/login">Đăng nhập</Link>
                    </Button>
                    <Button size="sm" className="h-8 px-2 sm:px-4 text-xs sm:text-sm" asChild>
                      <Link to="/register">Đăng ký</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tìm kiếm sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SearchBar />
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub Navigation */}
      <div className="bg-background border-b hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center gap-6 text-sm">
            <Link to="/?category=Flash Sale" className="hover:text-destructive transition-colors font-medium text-destructive">
              ⚡ Flash Sale
            </Link>
            <Link to="/?category=Ebook" className="hover:text-primary transition-colors">
              Ebook
            </Link>
            <Link to="/?category=Khóa học" className="hover:text-primary transition-colors">
              Khóa học
            </Link>
            <Link to="/?category=Phần mềm" className="hover:text-primary transition-colors">
              Phần mềm
            </Link>
            <Link to="/?category=Template" className="hover:text-primary transition-colors">
              Template
            </Link>
            <Link to="/?category=Dịch vụ" className="hover:text-primary transition-colors">
              Dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedNavbar;
