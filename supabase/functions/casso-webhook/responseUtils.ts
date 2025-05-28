
import { corsHeaders } from './types.ts'

export const createResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

export const createErrorResponse = (error: string, details?: string, status = 400) => {
  return createResponse({
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  }, status)
}

export const createSuccessResponse = (data: any) => {
  return createResponse({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  })
}
