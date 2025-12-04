import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WizardStep1BasicInfo from "./wizard/WizardStep1BasicInfo";
import WizardStep2Pricing from "./wizard/WizardStep2Pricing";
import WizardStep3Media from "./wizard/WizardStep3Media";
import WizardStep4Description from "./wizard/WizardStep4Description";
import WizardStep5Preview from "./wizard/WizardStep5Preview";
import { ProductVariant } from "@/lib/productValidationSchemas";

export interface WizardFormData {
  // Step 1
  title: string;
  category: string;
  product_type: string;
  warranty_period: string;
  
  // Step 2
  price: string;
  variants: ProductVariant[];
  
  // Step 3
  image: File | null;
  galleryImages: File[];
  file: File | null;
  
  // Step 4
  description: string;
  inStock: string;
  delivery_data: Record<string, any>;
}

const STEPS = [
  { id: 1, title: "Thông tin cơ bản", description: "Tên và loại sản phẩm" },
  { id: 2, title: "Giá & Gói sản phẩm", description: "Thiết lập giá và variants" },
  { id: 3, title: "Hình ảnh & File", description: "Upload media" },
  { id: 4, title: "Mô tả chi tiết", description: "Nội dung sản phẩm" },
  { id: 5, title: "Xem trước & Đăng", description: "Kiểm tra và hoàn tất" },
];

const ProductCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    title: "",
    category: "",
    product_type: "file_download",
    warranty_period: "none",
    price: "",
    variants: [],
    image: null,
    galleryImages: [],
    file: null,
    description: "",
    inStock: "",
    delivery_data: {},
  });

  const updateFormData = (data: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const progress = (currentStep / STEPS.length) * 100;

  const goNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WizardStep1BasicInfo formData={formData} updateFormData={updateFormData} onNext={goNext} />;
      case 2:
        return <WizardStep2Pricing formData={formData} updateFormData={updateFormData} onNext={goNext} onBack={goBack} />;
      case 3:
        return <WizardStep3Media formData={formData} updateFormData={updateFormData} onNext={goNext} onBack={goBack} />;
      case 4:
        return <WizardStep4Description formData={formData} updateFormData={updateFormData} onNext={goNext} onBack={goBack} />;
      case 5:
        return <WizardStep5Preview formData={formData} onBack={goBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{STEPS[currentStep - 1].title}</h3>
                <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Bước {currentStep}/{STEPS.length}</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${
                    step.id === currentStep
                      ? "text-primary font-medium"
                      : step.id < currentStep
                      ? "text-success"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                      ? "bg-success text-white"
                      : "bg-muted"
                  }`}>
                    {step.id < currentStep ? "✓" : step.id}
                  </div>
                  <p className="text-xs hidden sm:block">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {renderStep()}
    </div>
  );
};

export default ProductCreationWizard;
