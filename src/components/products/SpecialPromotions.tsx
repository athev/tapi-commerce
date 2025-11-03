import { Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SpecialPromotionsProps {
  promotions: string[];
}

export const SpecialPromotions = ({ promotions }: SpecialPromotionsProps) => {
  return (
    <Card className="bg-red-600 border-red-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-white rounded-full p-2 shrink-0">
            <Gift className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-2">
              Khuyến mãi đặc biệt
            </h3>
            <ul className="space-y-1.5 text-white text-sm">
              {promotions.map((promo, index) => (
                <li key={index} className="leading-relaxed">
                  {promo}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
