
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface ProductFileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}

const ProductFileUpload = ({ file, onFileChange, error }: ProductFileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file">File sản phẩm</Label>
      {file ? (
        <div className="flex items-center justify-between p-3 border rounded-md">
          <span className="text-sm text-gray-600">{file.name}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className={`border-2 border-dashed rounded-md p-6 text-center hover:border-gray-400 transition-colors ${error ? 'border-red-300' : 'border-gray-300'}`}>
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <Label htmlFor="file" className="cursor-pointer">
            <span className="text-sm text-gray-600">Nhấn để chọn file</span>
            <Input 
              id="file" 
              type="file"
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
        Upload file sản phẩm để khách hàng tải xuống sau khi mua (tùy chọn)
      </p>
    </div>
  );
};

export default ProductFileUpload;
