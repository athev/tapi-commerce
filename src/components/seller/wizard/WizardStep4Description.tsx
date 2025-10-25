import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WizardFormData } from "../ProductCreationWizard";
import ProductDescription from "../ProductDescription";
import { productDescriptionSchema } from "@/lib/productValidationSchemas";

interface WizardStep4Props {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const WizardStep4Description = ({ formData, updateFormData, onNext, onBack }: WizardStep4Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    try {
      productDescriptionSchema.parse({
        description: formData.description,
        inStock: formData.inStock,
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mô tả chi tiết</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProductDescription
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          error={errors.description}
        />

        <div className="space-y-2">
          <Label htmlFor="inStock">Số lượng trong kho (tùy chọn)</Label>
          <Input
            id="inStock"
            type="number"
            value={formData.inStock}
            onChange={(e) => updateFormData({ inStock: e.target.value })}
            placeholder="999"
            min="0"
          />
          <p className="text-xs text-muted-foreground">
            Để trống nếu không giới hạn số lượng
          </p>
        </div>

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

export default WizardStep4Description;
