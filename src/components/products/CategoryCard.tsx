
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export interface CategoryCardProps {
  id: string;
  title: string;
  icon: string;
  count: number;
}

const CategoryCard = ({ id, title, icon, count }: CategoryCardProps) => {
  return (
    <Link to={`/category/${id}`}>
      <Card className="overflow-hidden card-hover text-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <img src={icon} alt={title} className="w-12 h-12 object-contain" />
          </div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{count} sản phẩm</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
