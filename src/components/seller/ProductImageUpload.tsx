
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";

interface ProductImageUploadProps {
  image: File | null;
  onImageChange: (file: File | null) => void;
  error?: string;
}

const ProductImageUpload = ({ image, onImageChange, error }: ProductImageUploadProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn. Vui lòng chọn file dưới 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Vui lòng chọn file ảnh");
        return;
      }
      
      onImageChange(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn. Vui lòng chọn file dưới 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert("Vui lòng chọn file ảnh");
        return;
      }
      
      onImageChange(file);
      
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
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {image?.name}
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer
            ${isDragOver ? 'border-blue-400 bg-blue-50' : error ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'}
          `}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => document.getElementById('image')?.click()}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <Label htmlFor="image" className="cursor-pointer">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Nhấn để chọn ảnh</span>
              <span> hoặc kéo thả vào đây</span>
            </div>
            <Input 
              id="image" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </Label>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        Chọn ảnh đại diện cho sản phẩm (PNG, JPG, tối đa 5MB)
      </p>
    </div>
  );
};

export default ProductImageUpload;
