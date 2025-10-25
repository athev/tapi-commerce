import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";

interface ProductGalleryUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

const ProductGalleryUpload = ({ images, onImagesChange }: ProductGalleryUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isValidType && isValidSize;
      });
      
      // Limit to 5 images total
      const remainingSlots = 5 - images.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      
      onImagesChange([...images, ...filesToAdd]);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-2">
      <Label>Ảnh gallery (tùy chọn, tối đa 5 ảnh)</Label>
      
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {images.map((file, index) => (
          <Card key={index} className="relative group">
            <CardContent className="p-2">
              <img
                src={URL.createObjectURL(file)}
                alt={`Gallery ${index + 1}`}
                className="w-full h-24 object-cover rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {images.length < 5 && (
          <Card 
            className="border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <CardContent className="p-2 h-full flex flex-col items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Thêm ảnh</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Chấp nhận JPG, PNG, WEBP. Tối đa 5MB mỗi ảnh. ({images.length}/5)
      </p>
    </div>
  );
};

export default ProductGalleryUpload;
