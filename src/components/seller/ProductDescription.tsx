
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductDescriptionProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProductDescription = ({ value, onChange }: ProductDescriptionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Mô tả sản phẩm *</Label>
      <Textarea 
        id="description" 
        name="description" 
        rows={5}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
};

export default ProductDescription;
