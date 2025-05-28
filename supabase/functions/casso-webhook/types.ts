
export interface CassoTransactionData {
  id: number | string
  reference: string
  description: string
  amount: number
  runningBalance: number
  transactionDateTime: string
  accountNumber: string
  bankName: string
  bankAbbreviation: string
  virtualAccountNumber?: string
  virtualAccountName?: string
  counterAccountName?: string
  counterAccountNumber?: string
  counterAccountBankId?: string
  counterAccountBankName?: string
}

export interface CassoWebhookPayload {
  error: number
  data: CassoTransactionData
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-casso-signature',
}
