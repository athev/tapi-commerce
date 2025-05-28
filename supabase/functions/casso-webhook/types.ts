
export interface CassoTransaction {
  transaction_id: string
  amount: number
  description: string
  when: string
  account_number: string
}

export interface CassoWebhookPayload {
  data: CassoTransaction[]
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-casso-signature',
}
