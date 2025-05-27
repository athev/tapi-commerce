
import { Button } from "@/components/ui/button";

interface ManualConfirmationProps {
  showManualButton: boolean;
  onManualConfirmation: () => void;
}

const ManualConfirmation = ({ showManualButton, onManualConfirmation }: ManualConfirmationProps) => {
  if (!showManualButton) return null;

  return (
    <div className="pt-4 border-t">
      <Button 
        onClick={onManualConfirmation}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        Tôi đã chuyển khoản - Xác nhận thủ công
      </Button>
      <p className="text-xs text-gray-500 text-center mt-2">
        Nếu đã chuyển khoản nhưng chưa được xác nhận tự động trong 5 phút, vui lòng bấm nút trên
      </p>
    </div>
  );
};

export default ManualConfirmation;
