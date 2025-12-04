import { Image, Camera, ShoppingBag, Ticket } from "lucide-react";

interface SellerChatActionPanelProps {
  onGalleryClick: () => void;
  onCameraClick: () => void;
  onSendProductClick: () => void;
  onSendVoucherClick: () => void;
}

const SellerChatActionPanel = ({
  onGalleryClick,
  onCameraClick,
  onSendProductClick,
  onSendVoucherClick,
}: SellerChatActionPanelProps) => {
  const actions = [
    { icon: Image, label: "Thư viện", onClick: onGalleryClick, color: "text-blue-500" },
    { icon: Camera, label: "Máy ảnh", onClick: onCameraClick, color: "text-green-500" },
    { icon: ShoppingBag, label: "Gửi sản phẩm", onClick: onSendProductClick, color: "text-purple-500" },
    { icon: Ticket, label: "Gửi voucher", onClick: onSendVoucherClick, color: "text-orange-500" },
  ];

  return (
    <div className="bg-muted/50 border-t p-4">
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className={`w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm ${action.color}`}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SellerChatActionPanel;
