import { RefreshCw } from "lucide-react";

export const FreeReturnsSection = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <RefreshCw className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <p className="font-semibold text-blue-900 text-sm sm:text-base">
          Miễn phí đổi trả trong vòng 15 ngày
        </p>
        <p className="text-xs text-blue-700">Đổi trả dễ dàng, không mất phí</p>
      </div>
    </div>
  );
};
