
export interface SepayWebhookPayload {
  id: number                       // ID giao dịch trên SePay
  gateway: string                  // Brand name của ngân hàng (VD: "Vietcombank")
  transactionDate: string          // Thời gian xảy ra giao dịch (VD: "2023-03-25 14:02:37")
  accountNumber: string            // Số tài khoản ngân hàng
  code: string | null              // Mã code thanh toán (nếu có)
  content: string                  // Nội dung chuyển khoản
  transferType: "in" | "out"       // Loại giao dịch: in là tiền vào, out là tiền ra
  transferAmount: number           // Số tiền giao dịch
  accumulated: number              // Số dư tài khoản (lũy kế)
  subAccount: string | null        // Tài khoản ngân hàng phụ (tài khoản định danh)
  referenceCode: string            // Mã tham chiếu của tin nhắn SMS
  description: string              // Toàn bộ nội dung tin nhắn SMS
}

export interface SepayProcessingResult {
  transaction_id: string
  status: 'success' | 'no_order_found' | 'order_not_found' | 'amount_mismatch' | 'processing_error' | 'wrong_transfer_type'
  order?: any
  transaction_amount?: number
  extracted_order_id?: string
  expected?: number
  received?: number
  error?: string
}
