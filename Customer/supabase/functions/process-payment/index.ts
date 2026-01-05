import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, payment_method, payment_details } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Process payment based on method
    let paymentResult
    switch (payment_method) {
      case 'card':
        paymentResult = await processCardPayment(payment_details, order.total_amount)
        break
      case 'upi':
        paymentResult = await processUPIPayment(payment_details, order.total_amount)
        break
      case 'netbanking':
        paymentResult = await processNetBankingPayment(payment_details, order.total_amount)
        break
      default:
        throw new Error('Invalid payment method')
    }

    if (paymentResult.success) {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id)

      if (updateError) {
        throw updateError
      }

      // Send confirmation notifications
      await sendOrderConfirmation(order)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
          transaction_id: paymentResult.transaction_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      // Update payment status to failed
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id)

      return new Response(
        JSON.stringify({
          success: false,
          message: paymentResult.error || 'Payment failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Mock payment processing functions
async function processCardPayment(cardDetails: any, amount: number) {
  // In production, integrate with Stripe, Razorpay, etc.
  console.log('Processing card payment:', { amount, last4: cardDetails.number?.slice(-4) })
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock success (90% success rate)
  const success = Math.random() > 0.1
  
  return {
    success,
    transaction_id: success ? `txn_${Date.now()}` : null,
    error: success ? null : 'Card payment failed'
  }
}

async function processUPIPayment(upiDetails: any, amount: number) {
  console.log('Processing UPI payment:', { amount, upi_id: upiDetails.upi_id })
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const success = Math.random() > 0.05
  
  return {
    success,
    transaction_id: success ? `upi_${Date.now()}` : null,
    error: success ? null : 'UPI payment failed'
  }
}

async function processNetBankingPayment(bankDetails: any, amount: number) {
  console.log('Processing net banking payment:', { amount, bank: bankDetails.bank })
  
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const success = Math.random() > 0.08
  
  return {
    success,
    transaction_id: success ? `nb_${Date.now()}` : null,
    error: success ? null : 'Net banking payment failed'
  }
}

async function sendOrderConfirmation(order: any) {
  // In production, integrate with email service (SendGrid, AWS SES)
  // and SMS service (Twilio, AWS SNS)
  
  console.log('Sending order confirmation for order:', order.order_number)
  
  // Mock email sending
  const emailSent = await sendEmail({
    to: order.user_email,
    subject: `Order Confirmation - ${order.order_number}`,
    template: 'order_confirmation',
    data: order
  })
  
  // Mock SMS sending
  const smsSent = await sendSMS({
    to: order.user_phone,
    message: `Your order ${order.order_number} has been confirmed! Total: ₹${order.total_amount}`
  })
  
  return { emailSent, smsSent }
}

async function sendEmail(emailData: any) {
  // Mock email service
  console.log('Sending email:', emailData.subject)
  return true
}

async function sendSMS(smsData: any) {
  // Mock SMS service
  console.log('Sending SMS:', smsData.message)
  return true
}