import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import ProductTypeSelector from "../ProductTypeSelector";
import { WizardFormData } from "../ProductCreationWizard";
import { productBasicInfoSchema } from "@/lib/productValidationSchemas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WarrantyPeriodInput from "../WarrantyPeriodInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WizardStep1Props {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
  onNext: () => void;
}

const WizardStep1BasicInfo = ({ formData, updateFormData, onNext }: WizardStep1Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const validateAndNext = () => {
    try {
      productBasicInfoSchema.parse({
        title: formData.title,
        category: formData.category,
        product_type: formData.product_type,
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
        <CardTitle>Thông tin cơ bản</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Tên sản phẩm *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="VD: Khóa học lập trình React từ cơ bản đến nâng cao"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formData.title.length}/100 ký tự
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Danh mục *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => updateFormData({ category: value })}
          >
            <SelectTrigger className={errors.category ? "border-destructive" : ""}>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>

        <ProductTypeSelector
          value={formData.product_type}
          onChange={(value) => updateFormData({ product_type: value })}
          error={errors.product_type}
        />

        <WarrantyPeriodInput
          value={formData.warranty_period || 'none'}
          onChange={(value) => updateFormData({ warranty_period: value })}
        />

        <div className="flex justify-end pt-4">
          <Button onClick={validateAndNext} size="lg">
            Tiếp theo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WizardStep1BasicInfo;
