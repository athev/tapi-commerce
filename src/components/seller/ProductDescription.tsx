
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductDescriptionProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

const ProductDescription = ({ value, onChange, error }: ProductDescriptionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Mô tả sản phẩm *</Label>
      <Textarea 
        id="description" 
        name="description" 
        rows={5}
        value={value}
        onChange={onChange}
        className={error ? "border-red-500" : ""}
        placeholder="Mô tả chi tiết về sản phẩm của bạn..."
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Ít nhất 10 ký tự</span>
        <span>{value.length}/1000</span>
      </div>
    </div>
  );
};

export default ProductDescription;
