
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface ProductImageUploadProps {
  image: File | null;
  onImageChange: (file: File | null) => void;
}

const ProductImageUpload = ({ image, onImageChange }: ProductImageUploadProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageChange(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    onImageChange(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image">Ảnh sản phẩm *</Label>
      {imagePreview ? (
        <div className="relative">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <Label htmlFor="image" className="cursor-pointer">
            <span className="text-sm text-gray-600">Nhấn để chọn ảnh</span>
            <Input 
              id="image" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              required
            />
          </Label>
        </div>
      )}
      <p className="text-xs text-gray-500">
        Chọn ảnh đại diện cho sản phẩm (PNG, JPG, tối đa 5MB)
      </p>
    </div>
  );
};

export default ProductImageUpload;
