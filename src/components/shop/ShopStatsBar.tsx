interface ShopStatsBarProps {
  productsCount: number;
  rating?: number;
  responseRate?: number;
  className?: string;
}
const ShopStatsBar = ({
  productsCount,
  rating = 5,
  responseRate = 98
}: ShopStatsBarProps) => {
  return <div className="mx-3 my-2">
      <div className="bg-card rounded-lg border shadow-sm px-0 py-0 my-0 mx-[6px]">
        <div className="grid grid-cols-3 divide-x divide-border mx-[4px] px-[2px] py-0 my-0">
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-sm font-bold text-foreground">
              {productsCount}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
              Sản phẩm
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-sm font-bold text-foreground">
              {rating.toFixed(1)}/5.0
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
              Đánh giá
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-sm font-bold text-foreground">
              {responseRate}%
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
              Phản hồi
            </span>
          </div>
        </div>
      </div>
    </div>;
};
export default ShopStatsBar;