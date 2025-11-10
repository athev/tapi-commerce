import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const FavoriteButton = ({ 
  productId, 
  size = 'md',
  showLabel = false,
  className 
}: FavoriteButtonProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(productId);

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Button
      size={showLabel ? "sm" : "icon"}
      variant="secondary"
      className={cn(
        "rounded-full shadow-md transition-all",
        !showLabel && sizeClasses[size],
        favorited 
          ? "bg-red-50 hover:bg-red-100 text-red-500" 
          : "bg-white/90 hover:bg-white",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
    >
      <Heart 
        className={cn(
          "transition-all",
          iconSizes[size],
          favorited && "fill-red-500"
        )} 
      />
      {showLabel && (
        <span className="ml-2">
          {favorited ? 'Đã thích' : 'Yêu thích'}
        </span>
      )}
    </Button>
  );
};
