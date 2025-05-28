
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== DEBUG CASSO WEBHOOK TEST ===')
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('Headers:', Object.fromEntries(req.headers))
    
    const body = await req.text()
    console.log('Body:', body)
    
    // Test calling the actual casso webhook
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/casso-webhook`
    console.log('Testing webhook URL:', webhookUrl)
    
    const testPayload = {
      error: 0,
      data: [{
        id: 999999,
        tid: "TEST_TRANSACTION",
        description: "Test webhook - DH4d3d37edec53",
        amount: 100000,
        cusum_balance: 1000000,
        when: new Date().toISOString(),
        bank_sub_acc_id: "12345",
        subAccId: "12345"
      }]
    }
    
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-casso-signature': 'test_signature'
        },
        body: JSON.stringify(testPayload)
      })
      
      const responseText = await webhookResponse.text()
      console.log('Webhook response status:', webhookResponse.status)
      console.log('Webhook response:', responseText)
      
      return new Response(JSON.stringify({
        success: true,
        webhook_status: webhookResponse.status,
        webhook_response: responseText,
        test_payload: testPayload
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } catch (error) {
      console.error('Error calling webhook:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        test_payload: testPayload
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
  } catch (error) {
    console.error('Debug error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
