import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  title?: string;
}

const ProductImageGallery = ({ images, title }: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Không có hình ảnh</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-zoom-in">
            <img
              src={images[selectedImage] || '/placeholder.svg'}
              alt={title || 'Product image'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onClick={() => setLightboxOpen(true)}
            />
            <div className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-5 w-5" />
            </div>
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image || '/placeholder.svg'}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image Count Badge */}
          {images.length > 1 && (
            <Badge variant="secondary" className="w-fit">
              {selectedImage + 1} / {images.length}
            </Badge>
          )}
        </div>

        {/* Lightbox */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={images.map(src => ({ src }))}
          index={selectedImage}
        />
      </CardContent>
    </Card>
  );
};

export default ProductImageGallery;
