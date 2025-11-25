import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { WizardFormData } from "../ProductCreationWizard";
import ProductImageUpload from "../ProductImageUpload";
import ProductGalleryUpload from "../ProductGalleryUpload";
import ProductFileUpload from "../ProductFileUpload";
import { productImageSchema } from "@/lib/productValidationSchemas";

interface WizardStep3Props {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const WizardStep3Media = ({ formData, updateFormData, onNext, onBack }: WizardStep3Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    try {
      if (formData.image) {
        productImageSchema.parse(formData.image);
      } else {
        throw new Error("Vui lòng chọn ảnh đại diện");
      }
      setErrors({});
      onNext();
    } catch (error: any) {
      setErrors({ image: error.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hình ảnh & File sản phẩm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProductImageUpload
          image={formData.image}
          onImageChange={(image) => updateFormData({ image })}
          error={errors.image}
        />

        <ProductGalleryUpload
          images={formData.galleryImages}
          onImagesChange={(galleryImages) => updateFormData({ galleryImages })}
        />

        {formData.product_type === 'service' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>💡 Sản phẩm dịch vụ không yêu cầu upload file.</strong>
              <br />
              Bạn sẽ liên hệ trực tiếp với khách hàng qua chat để thực hiện dịch vụ.
            </AlertDescription>
          </Alert>
        )}

        {formData.product_type === 'file_download' && (
          <ProductFileUpload
            file={formData.file}
            onFileChange={(file) => updateFormData({ file })}
          />
        )}

        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button onClick={validateAndNext}>
            Tiếp theo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WizardStep3Media;
