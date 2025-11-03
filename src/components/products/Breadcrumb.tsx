import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbProps {
  category: string;
  productTitle: string;
}

export const Breadcrumb = ({ category, productTitle }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link 
        to="/" 
        className="hover:text-primary flex items-center gap-1 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Trang chủ</span>
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link 
        to={`/?category=${category}`} 
        className="hover:text-primary transition-colors"
      >
        {category}
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium line-clamp-1">
        {productTitle}
      </span>
    </nav>
  );
};
