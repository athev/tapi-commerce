
export interface CassoTransactionData {
  id: number
  tid: string
  description: string
  amount: number
  cusum_balance: number
  when: string
  bank_sub_acc_id: string
  subAccId: string
  bank_name?: string
  bank_abbr?: string
  virtual_account?: string
  virtual_account_name?: string
  corresponsive_account?: string
  corresponsive_name?: string
  corresponsive_bank_id?: string
  corresponsive_bank_name?: string
}

export interface CassoWebhookPayload {
  error: number
  data: CassoTransactionData[]
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-casso-signature, secure-token',
}
