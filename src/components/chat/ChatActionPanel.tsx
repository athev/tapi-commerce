import { Image, Camera, ShoppingBag, Ticket, ShoppingCart } from "lucide-react";

interface ChatActionPanelProps {
  onOpenGallery: () => void;
  onOpenCamera: () => void;
  onOpenProducts: () => void;
  onOpenVouchers: () => void;
  onQuickBuy: () => void;
  hasCurrentProduct?: boolean;
}

const ChatActionPanel = ({
  onOpenGallery,
  onOpenCamera,
  onOpenProducts,
  onOpenVouchers,
  onQuickBuy,
  hasCurrentProduct,
}: ChatActionPanelProps) => {
  const ActionButton = ({ 
    icon, 
    label, 
    onClick,
    highlight
  }: { 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void;
    highlight?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
        highlight 
          ? 'bg-destructive/10 text-destructive' 
          : 'hover:bg-muted'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        highlight 
          ? 'bg-destructive text-destructive-foreground' 
          : 'bg-muted'
      }`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="bg-background border-t p-4 animate-in slide-in-from-bottom-2 duration-200">
      <div className="grid grid-cols-4 gap-2">
        <ActionButton 
          icon={<Image className="h-5 w-5" />} 
          label="Thư viện" 
          onClick={onOpenGallery} 
        />
        <ActionButton 
          icon={<Camera className="h-5 w-5" />} 
          label="Máy ảnh" 
          onClick={onOpenCamera} 
        />
        <ActionButton 
          icon={<ShoppingBag className="h-5 w-5" />} 
          label="Sản phẩm" 
          onClick={onOpenProducts} 
        />
        <ActionButton 
          icon={<Ticket className="h-5 w-5" />} 
          label="Voucher" 
          onClick={onOpenVouchers} 
        />
      </div>
      {hasCurrentProduct && (
        <div className="mt-3 pt-3 border-t">
          <ActionButton 
            icon={<ShoppingCart className="h-5 w-5" />} 
            label="Mua Ngay" 
            onClick={onQuickBuy}
            highlight
          />
        </div>
      )}
    </div>
  );
};

export default ChatActionPanel;
