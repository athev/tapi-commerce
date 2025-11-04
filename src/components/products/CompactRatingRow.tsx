import { Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CompactRatingRowProps {
  rating?: number;
  reviewCount?: number;
  purchases?: number;
  complaintRate?: number;
}

const CompactRatingRow = ({
  rating = 5.0,
  reviewCount = 0,
  purchases = 0,
  complaintRate
}: CompactRatingRowProps) => {
  return (
    <div className="flex items-center gap-3 flex-wrap text-sm py-2 border-b">
      {/* Star rating */}
      <div className="flex items-center gap-1">
        <div className="flex">
          {Array(5).fill(0).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <span className="font-bold text-base">{rating.toFixed(1)}</span>
      </div>
      
      <Separator orientation="vertical" className="h-4" />
      
      {/* Review count */}
      <span className="text-muted-foreground">
        <strong className="text-foreground">{reviewCount}</strong> đánh giá
      </span>
      
      <Separator orientation="vertical" className="h-4" />
      
      {/* Purchases */}
      <span className="text-muted-foreground">
        <strong className="text-foreground">{purchases}</strong> đã bán
      </span>
      
      {/* Complaint rate (conditional) */}
      {complaintRate !== undefined && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <span className={cn(
            "font-semibold",
            complaintRate < 1 ? "text-green-600" : 
            complaintRate < 3 ? "text-yellow-600" : "text-red-600"
          )}>
            {complaintRate.toFixed(1)}% khiếu nại
          </span>
        </>
      )}
    </div>
  );
};

export default CompactRatingRow;
