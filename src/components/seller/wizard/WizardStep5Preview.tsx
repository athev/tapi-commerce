import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Sparkles, Save } from "lucide-react";
import { WizardFormData } from "../ProductCreationWizard";
import { useProductUpload, ProductFormData } from "@/hooks/useProductUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { getWarrantyPeriodText } from "@/utils/warrantyUtils";

interface WizardStep5Props {
  formData: WizardFormData;
  onBack: () => void;
}

const WizardStep5Preview = ({ formData, onBack }: WizardStep5Props) => {
  const { submitProduct, isSubmitting } = useProductUpload();
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const handlePublish = async () => {
    const productData: ProductFormData = {
      ...formData,
      delivery_data: formData.delivery_data || {},
      warranty_period: formData.warranty_period || 'none',
    };
    await submitProduct(productData);
  };

  const handleSaveDraft = async () => {
    setSaveAsDraft(true);
    // TODO: Implement draft save functionality
    setSaveAsDraft(false);
  };

  const checklist = [
    { label: "Có ảnh đại diện", checked: !!formData.image },
    { label: "Có mô tả đầy đủ", checked: formData.description.length >= 50 },
    { label: "Đã thiết lập giá", checked: !!formData.price },
    // Only check for file if product type is file_download
    ...(formData.product_type === 'file_download' 
      ? [{ 
          label: "Có file sản phẩm", 
          checked: !!formData.file,
          optional: false
        }]
      : []
    ),
  ];

  const allChecked = checklist.filter(item => !item.optional).every(item => item.checked);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xem trước sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Preview */}
          <div className="border rounded-lg p-6 space-y-4">
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">
                  {formData.category}
                </Badge>
                <Badge variant="outline">
                  {formData.product_type === 'service' ? '🎧 Dịch vụ' : 
                   formData.product_type === 'file_download' ? '📁 File tải về' : 
                   formData.product_type === 'license_key_delivery' ? '🔑 License Key' :
                   formData.product_type === 'shared_account' ? '👥 Tài khoản chung' :
                   '📦 ' + formData.product_type}
                </Badge>
                {formData.warranty_period && formData.warranty_period !== 'none' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    🛡️ Bảo hành {getWarrantyPeriodText(formData.warranty_period)}
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2">{formData.title}</h3>
              <p className="text-3xl font-bold text-destructive">
                {formatPrice(formData.price)}
              </p>
            </div>

            {formData.variants.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Các gói sản phẩm:</h4>
                <div className="space-y-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{variant.variant_name}</p>
                        {variant.badge && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {variant.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-destructive">
                          {formatPrice(variant.price)}
                        </p>
                        {variant.original_price && (
                          <p className="text-sm line-through text-muted-foreground">
                            {formatPrice(variant.original_price)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Mô tả:</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {formData.description}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold mb-3">Checklist hoàn thành:</p>
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {item.checked ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <div className="h-5 w-5 border-2 rounded-full" />
                    )}
                    <span className={item.checked ? "text-success" : ""}>
                      {item.label}
                      {item.optional && " (tùy chọn)"}
                    </span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={onBack} variant="outline" className="flex-1">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại chỉnh sửa
            </Button>
            
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={saveAsDraft}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Lưu nháp
            </Button>

            <Button
              onClick={handlePublish}
              disabled={!allChecked || isSubmitting}
              className="flex-1"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isSubmitting ? "Đang đăng..." : "Đăng sản phẩm"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WizardStep5Preview;
