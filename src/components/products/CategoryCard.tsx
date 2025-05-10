
import { Card, CardContent } from "@/components/ui/card";

export interface CategoryCardProps {
  id: string;
  title: string;
  icon: string;
  count: number;
}

const CategoryCard = ({ id, title, icon, count }: CategoryCardProps) => {
  return (
    <Card className="overflow-hidden card-hover text-center hover:border-marketplace-primary transition-all duration-300">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="bg-gray-100 p-4 rounded-full mb-4 hover:bg-gray-200 transition-colors">
          <img src={icon} alt={title} className="w-12 h-12 object-contain" />
        </div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{count} sản phẩm</p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
