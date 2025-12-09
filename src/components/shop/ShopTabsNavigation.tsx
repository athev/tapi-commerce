import { cn } from "@/lib/utils";
import { Home, Package, Flame, Sparkles } from "lucide-react";

export type ShopTab = "home" | "all" | "bestsellers" | "new";

interface ShopTabsNavigationProps {
  activeTab: ShopTab;
  onTabChange: (tab: ShopTab) => void;
  productsCount?: number;
}

const ShopTabsNavigation = ({ 
  activeTab, 
  onTabChange,
  productsCount = 0 
}: ShopTabsNavigationProps) => {
  
  const tabs = [
    { 
      id: "home" as ShopTab, 
      label: "Trang chủ", 
      icon: Home 
    },
    { 
      id: "all" as ShopTab, 
      label: "Tất cả sản phẩm", 
      icon: Package,
      count: productsCount 
    },
    { 
      id: "bestsellers" as ShopTab, 
      label: "Bán chạy", 
      icon: Flame 
    },
    { 
      id: "new" as ShopTab, 
      label: "Mới nhất", 
      icon: Sparkles 
    }
  ];

  return (
    <div className="mx-4 md:mx-8 mt-4">
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 flex-1 min-w-fit",
                "text-sm md:text-base font-medium transition-all duration-200",
                "border-b-2 hover:bg-muted/50",
                activeTab === tab.id 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn(
                "h-4 w-4 md:h-5 md:w-5 flex-shrink-0",
                activeTab === tab.id ? "text-primary" : ""
              )} />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.id 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopTabsNavigation;
