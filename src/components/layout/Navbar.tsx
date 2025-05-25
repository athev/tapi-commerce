
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="mr-6 flex items-center">
          <span className="text-xl font-bold text-marketplace-primary">DigitalMarket</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-4 lg:space-x-6">
          <Link to="/products" className="text-sm font-medium transition-colors hover:text-marketplace-primary">
            Sản phẩm
          </Link>
          <Link to="/services" className="text-sm font-medium transition-colors hover:text-marketplace-primary">
            Dịch vụ
          </Link>
          <Link to="/categories" className="text-sm font-medium transition-colors hover:text-marketplace-primary">
            Danh mục
          </Link>
          <Link to="/help" className="text-sm font-medium transition-colors hover:text-marketplace-primary">
            Hỗ trợ
          </Link>
          
          {/* Seller button for authenticated sellers */}
          {user && (profile?.role === 'seller' || profile?.role === 'admin') && (
            <Link to="/seller" className="text-sm font-medium transition-colors hover:text-marketplace-primary bg-green-50 px-3 py-2 rounded-md border border-green-200 flex items-center gap-2">
              <Store className="h-4 w-4" />
              Kênh người bán
            </Link>
          )}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden w-full max-w-sm md:flex items-center space-x-2 px-4">
          <Input 
            type="search" 
            placeholder="Tìm kiếm sản phẩm..." 
            className="h-9 md:w-[200px] lg:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground">
            <Search className="h-4 w-4" />
            <span className="sr-only">Tìm kiếm</span>
          </Button>
        </form>

        {/* User menu */}
        <div className="flex items-center space-x-4">
          {user && (
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-marketplace-primary text-xs font-medium text-white flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/my-account">Tài khoản của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-purchases">Sản phẩm đã mua</Link>
                  </DropdownMenuItem>
                  {(profile?.role === 'seller' || profile?.role === 'admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/seller">
                        <Store className="mr-2 h-4 w-4" />
                        Kênh người bán
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Quản trị viên</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Đăng nhập</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register">Đăng ký</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
