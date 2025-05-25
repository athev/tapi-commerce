
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CategoryCardProps {
  id: string;
  title: string;
  icon: string;
  count: number;
  isActive?: boolean;
}

const CategoryCard = ({ id, title, icon, count, isActive = false }: CategoryCardProps) => {
  return (
    <Card className={`
      overflow-hidden text-center transition-all duration-300 cursor-pointer
      ${isActive 
        ? 'border-marketplace-primary bg-marketplace-primary/5 shadow-md' 
        : 'hover:border-marketplace-primary/50 hover:shadow-md border-gray-200'
      }
    `}>
      <CardContent className="flex flex-col items-center justify-center p-4 md:p-6 h-full min-h-[120px]">
        <div className={`
          p-3 md:p-4 rounded-full mb-3 transition-all duration-300
          ${isActive 
            ? 'bg-marketplace-primary/10' 
            : 'bg-gray-100 group-hover:bg-gray-200'
          }
        `}>
          <img 
            src={icon} 
            alt={title} 
            className="w-8 h-8 md:w-12 md:h-12 object-contain" 
            loading="lazy"
          />
        </div>
        
        <h3 className={`
          font-medium text-sm md:text-base mb-2 line-clamp-2
          ${isActive ? 'text-marketplace-primary' : 'text-gray-900'}
        `}>
          {title}
        </h3>
        
        <Badge 
          variant={isActive ? "default" : "secondary"}
          className={`
            text-xs
            ${isActive 
              ? 'bg-marketplace-primary text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          {count} sản phẩm
        </Badge>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
