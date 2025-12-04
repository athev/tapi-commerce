import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/utils/priceUtils";

interface ProductCardInChatProps {
  product: {
    id: string;
    title: string;
    image?: string;
    price: number;
    slug?: string;
  };
  onBuyNow?: () => void;
}

const ProductCardInChat = ({ product, onBuyNow }: ProductCardInChatProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate(`/product/id/${product.id}`);
    }
  };

  return (
    <div className="bg-muted/50 border rounded-lg mx-3 my-2 overflow-hidden">
      <p className="text-xs text-muted-foreground px-3 py-2 bg-muted/80">
        Bạn đang hỏi về sản phẩm này
      </p>
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={handleClick}
      >
        <img 
          src={product.image || '/placeholder.svg'} 
          alt={product.title}
          className="w-16 h-16 rounded-lg object-cover border"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm line-clamp-2 text-foreground">{product.title}</p>
          <p className="text-destructive font-bold mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
      {onBuyNow && (
        <div className="px-3 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow();
            }}
            className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
          >
            Mua ngay
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCardInChat;
