import { z } from "zod";

// Order form validation schemas
export const upgradeAccountNoPassSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ")
    .max(255, "Email không được vượt quá 255 ký tự"),
});

export const upgradeAccountWithPassSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ")
    .max(255, "Email không được vượt quá 255 ký tự"),
  username: z.string()
    .trim()
    .min(1, "Tên đăng nhập là bắt buộc")
    .max(100, "Tên đăng nhập không được vượt quá 100 ký tự"),
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự"),
});

// Withdrawal form validation schema
export const withdrawalSchema = z.object({
  pi_amount: z.number()
    .min(10, "Số tiền rút tối thiểu là 10 PI")
    .positive("Số tiền phải là số dương"),
  bank_name: z.string()
    .trim()
    .min(1, "Vui lòng chọn ngân hàng")
    .max(100, "Tên ngân hàng không hợp lệ"),
  bank_account_number: z.string()
    .trim()
    .min(1, "Số tài khoản là bắt buộc")
    .max(50, "Số tài khoản không hợp lệ")
    .regex(/^[0-9]+$/, "Số tài khoản chỉ được chứa số"),
  bank_account_name: z.string()
    .trim()
    .min(1, "Tên chủ tài khoản là bắt buộc")
    .max(100, "Tên chủ tài khoản không được vượt quá 100 ký tự"),
});

// Seller application validation schema
export const sellerApplicationSchema = z.object({
  business_name: z.string()
    .trim()
    .min(1, "Tên doanh nghiệp là bắt buộc")
    .max(200, "Tên doanh nghiệp không được vượt quá 200 ký tự"),
  business_description: z.string()
    .trim()
    .min(10, "Mô tả doanh nghiệp phải có ít nhất 10 ký tự")
    .max(1000, "Mô tả doanh nghiệp không được vượt quá 1000 ký tự"),
  phone: z.string()
    .trim()
    .min(10, "Số điện thoại không hợp lệ")
    .max(15, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại chỉ được chứa số và ký tự đặc biệt"),
  address: z.string()
    .trim()
    .min(1, "Địa chỉ là bắt buộc")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự")
    .optional(),
});
