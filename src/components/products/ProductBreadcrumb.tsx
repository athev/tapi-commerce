
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductBreadcrumbProps {
  category?: string;
  title?: string;
}

const ProductBreadcrumb = ({ category, title }: ProductBreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 border-b">
      <div className="container py-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-0 h-auto text-sm hover:text-marketplace-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Trang chủ
          </Button>
          <span>/</span>
          <span className="hidden sm:inline text-gray-500">{category}</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-gray-900 font-medium truncate">{title}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductBreadcrumb;
