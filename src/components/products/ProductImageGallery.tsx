import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
interface ProductImageGalleryProps {
  images: string[];
  title?: string;
}
const ProductImageGallery = ({
  images,
  title
}: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  if (!images || images.length === 0) {
    return <Card>
        <CardContent className="p-6">
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Không có hình ảnh</span>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden px-[13px] relative">
            <img src={images[selectedImage] || '/placeholder.svg'} alt={title || 'Product image'} className="w-full h-full object-cover" />
            
            {/* FOMO Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge className="bg-red-500/90 text-white backdrop-blur-sm shadow-lg">
                🔥 HOT
              </Badge>
            </div>
            
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm">
                👁️ 12 đang xem
              </Badge>
            </div>
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => <button key={index} onClick={() => setSelectedImage(index)} className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}`}>
                  <img src={image || '/placeholder.svg'} alt={`${title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>)}
            </div>}

          {/* Image Count Badge */}
          {images.length > 1 && <Badge variant="secondary" className="w-fit">
              {selectedImage + 1} / {images.length}
            </Badge>}
        </div>
      </CardContent>
    </Card>;
};
export default ProductImageGallery;