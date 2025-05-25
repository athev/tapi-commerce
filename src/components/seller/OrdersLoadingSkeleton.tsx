
import { Skeleton } from "@/components/ui/skeleton";

const OrdersLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="bg-white rounded-lg border p-4">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default OrdersLoadingSkeleton;
