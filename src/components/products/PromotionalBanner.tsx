import { Button } from "@/components/ui/button";

export const PromotionalBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-6 text-white shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-base sm:text-lg font-bold">GIỚI THIỆU NHÀ BÁN HÀNG MỚI</h3>
          <p className="text-xs sm:text-sm">Nhận Quà Lên Tới 1.1 triệu</p>
        </div>
        <Button className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10 shrink-0">
          GIỚI THIỆU NGAY
        </Button>
      </div>
    </div>
  );
};
