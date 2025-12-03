import { z } from 'zod';

// Basic product info validation
export const productBasicInfoSchema = z.object({
  title: z.string()
    .min(10, "Tên sản phẩm phải có ít nhất 10 ký tự")
    .max(100, "Tên sản phẩm không được quá 100 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  product_type: z.string().min(1, "Vui lòng chọn loại sản phẩm"),
});

// Pricing validation
export const productPricingSchema = z.object({
  price: z.string()
    .min(1, "Vui lòng nhập giá")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1000 && num <= 100000000;
    }, "Giá phải từ 1,000₫ đến 100,000,000₫"),
});

// Variant validation
export const productVariantSchema = z.object({
  id: z.string().optional(),
  variant_name: z.string().min(1, "Tên gói không được để trống").max(50, "Tên gói không được quá 50 ký tự"),
  price: z.number()
    .min(1000, "Giá phải từ 1,000₫")
    .max(100000000, "Giá không được quá 100,000,000₫"),
  original_price: z.number().optional().nullable(),
  discount_percentage: z.number().min(0).max(100).optional().nullable(),
  badge: z.string().max(20, "Badge không được quá 20 ký tự").optional().nullable(),
  sort_order: z.number().default(0),
  is_active: z.boolean().default(true),
  in_stock: z.number().min(0, "Số lượng phải >= 0").default(999),
  description: z.string().max(500, "Mô tả không được quá 500 ký tự").optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

// Image validation
export const productImageSchema = z.custom<File>()
  .refine((file) => file instanceof File, "Vui lòng chọn ảnh")
  .refine((file) => file.size <= 5 * 1024 * 1024, "Ảnh không được quá 5MB")
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    "Chỉ chấp nhận định dạng JPG, PNG, WEBP"
  );

// Product file validation
export const productFileSchema = z.custom<File>()
  .optional()
  .refine(
    (file) => !file || file.size <= 100 * 1024 * 1024,
    "File không được quá 100MB"
  );

// Description validation
export const productDescriptionSchema = z.object({
  description: z.string()
    .min(50, "Mô tả phải có ít nhất 50 ký tự")
    .max(5000, "Mô tả không được quá 5000 ký tự"),
  inStock: z.string().optional(),
});

// Complete product validation
export const completeProductSchema = productBasicInfoSchema
  .merge(productPricingSchema)
  .merge(productDescriptionSchema)
  .extend({
    image: productImageSchema,
    file: productFileSchema,
    delivery_data: z.record(z.any()).optional(),
  });

export type ProductVariant = z.infer<typeof productVariantSchema>;
