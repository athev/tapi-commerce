import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, MessageCircle, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavigationItems = () => (
    <>
      <Link 
        to="/" 
        className="text-sm font-medium hover:text-marketplace-primary transition-colors"
        onClick={() => setIsOpen(false)}
      >
        Trang chủ
      </Link>
      <Link 
        to="/categories" 
        className="text-sm font-medium hover:text-marketplace-primary transition-colors"
        onClick={() => setIsOpen(false)}
      >
        Danh mục
      </Link>
      <Link 
        to="/sellers" 
        className="text-sm font-medium hover:text-marketplace-primary transition-colors"
        onClick={() => setIsOpen(false)}
      >
        Người bán
      </Link>
      {user && (
        <Link 
          to="/chat" 
          className="text-sm font-medium hover:text-marketplace-primary transition-colors flex items-center"
          onClick={() => setIsOpen(false)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Tin nhắn
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-marketplace-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:inline-block">
                Sàn Phẩm Số
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavigationItems />
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <NotificationDropdown />

                {/* Chat */}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/chat">
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          Tài khoản của bạn
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/my-purchases">
                          <User className="mr-2 h-4 w-4" />
                          <span>Tài khoản</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/seller">
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
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <NavigationItems />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
