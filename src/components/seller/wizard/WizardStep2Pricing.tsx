import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { WizardFormData } from "../ProductCreationWizard";
import { productPricingSchema } from "@/lib/productValidationSchemas";
import ProductVariantsManager from "../ProductVariantsManager";

interface WizardStep2Props {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const WizardStep2Pricing = ({ formData, updateFormData, onNext, onBack }: WizardStep2Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVariants, setShowVariants] = useState(formData.variants.length > 0);

  const validateAndNext = () => {
    try {
      productPricingSchema.parse({ price: formData.price });
      setErrors({});
      onNext();
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giá & Gói sản phẩm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="price">Giá cơ bản *</Label>
          <div className="relative">
            <Input
              id="price"
              value={formatPrice(formData.price)}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                updateFormData({ price: value });
              }}
              placeholder="50,000"
              className={errors.price ? "border-destructive" : ""}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₫
            </span>
          </div>
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Giá từ 1,000₫ đến 100,000,000₫
          </p>
        </div>

        {!showVariants && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowVariants(true)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm các gói sản phẩm (tùy chọn)
          </Button>
        )}

        {showVariants && (
          <ProductVariantsManager
            variants={formData.variants}
            onVariantsChange={(variants) => updateFormData({ variants })}
            basePrice={parseInt(formData.price) || 0}
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

export default WizardStep2Pricing;
