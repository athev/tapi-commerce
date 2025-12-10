import { cn } from "@/lib/utils";

export type ShopTab = "home" | "products" | "profile";

interface ShopTabsNavigationProps {
  activeTab: ShopTab;
  onTabChange: (tab: ShopTab) => void;
}

const ShopTabsNavigation = ({ 
  activeTab, 
  onTabChange 
}: ShopTabsNavigationProps) => {
  
  const tabs = [
    { id: "home" as ShopTab, label: "Dạo" },
    { id: "products" as ShopTab, label: "Sản phẩm" },
    { id: "profile" as ShopTab, label: "Hồ sơ" }
  ];

  return (
    <div className="bg-card border-b sticky top-0 z-10">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShopTabsNavigation;
