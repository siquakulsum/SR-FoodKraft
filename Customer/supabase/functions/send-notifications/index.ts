import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, notification_type, custom_message } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get order with user details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        user_profiles (
          name,
          phone
        )
      `)
      .eq('id', order_id)
      .single()

    if (error || !order) {
      throw new Error('Order not found')
    }

    let message = custom_message
    let subject = ''

    // Generate notification content based on type
    switch (notification_type) {
      case 'order_placed':
        subject = `Order Placed - ${order.order_number}`
        message = `Dear ${order.user_profiles.name}, your order ${order.order_number} has been placed successfully. Total: ₹${order.total_amount}`
        break
      
      case 'payment_confirmed':
        subject = `Payment Confirmed - ${order.order_number}`
        message = `Payment confirmed for order ${order.order_number}. We'll start preparing your delicious food soon!`
        break
      
      case 'preparing':
        subject = `Order Being Prepared - ${order.order_number}`
        message = `Great news! Our chefs have started preparing your order ${order.order_number}. Expected delivery: ${order.event_date} at ${order.event_time}`
        break
      
      case 'out_for_delivery':
        subject = `Order Out for Delivery - ${order.order_number}`
        message = `Your order ${order.order_number} is on its way! Our delivery team will reach you soon.`
        break
      
      case 'delivered':
        subject = `Order Delivered - ${order.order_number}`
        message = `Your order ${order.order_number} has been delivered successfully. Enjoy your meal! Please rate your experience.`
        break
      
      default:
        message = custom_message || 'Order update notification'
        subject = `Order Update - ${order.order_number}`
    }

    // Send email notification
    const emailResult = await sendEmailNotification({
      to: order.user_email || 'customer@example.com',
      subject,
      message,
      order
    })

    // Send SMS notification
    const smsResult = await sendSMSNotification({
      to: order.user_profiles?.phone || '+919876543210',
      message,
      order
    })

    // Send WhatsApp notification (optional)
    const whatsappResult = await sendWhatsAppNotification({
      to: order.user_profiles?.phone || '+919876543210',
      message,
      order
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications sent successfully',
        results: {
          email: emailResult,
          sms: smsResult,
          whatsapp: whatsappResult
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
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

async function sendEmailNotification(emailData: any) {
  try {
    // In production, use SendGrid, AWS SES, or similar service
    console.log('Sending email notification:', {
      to: emailData.to,
      subject: emailData.subject
    })

    // Mock email template
    const emailTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; text-align: center;">
            <h1 style="color: #000; margin: 0;">SR FoodKraft</h1>
            <p style="color: #000; margin: 5px 0;">Premium Catering Services</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #333;">${emailData.subject}</h2>
            <p style="color: #666; line-height: 1.6;">${emailData.message}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p><strong>Order Number:</strong> ${emailData.order.order_number}</p>
              <p><strong>Event Date:</strong> ${emailData.order.event_date}</p>
              <p><strong>Event Time:</strong> ${emailData.order.event_time}</p>
              <p><strong>Total Amount:</strong> ₹${emailData.order.total_amount}</p>
              <p><strong>Status:</strong> ${emailData.order.status}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://srfoodkraft.com/orders" 
                 style="background: #FFD700; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
            <p>Need help? Contact us:</p>
            <p>📞 +91 98765 43210 | ✉️ info@srfoodkraft.com</p>
            <p style="margin-top: 15px; font-size: 12px; color: #ccc;">
              © 2025 SR FoodKraft. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `

    // Mock successful email sending
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: `email_${Date.now()}`
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function sendSMSNotification(smsData: any) {
  try {
    // In production, use Twilio, AWS SNS, or similar service
    console.log('Sending SMS notification:', {
      to: smsData.to,
      message: smsData.message.substring(0, 50) + '...'
    })

    // Mock SMS sending
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      success: true,
      message: 'SMS sent successfully',
      messageId: `sms_${Date.now()}`
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function sendWhatsAppNotification(whatsappData: any) {
  try {
    // In production, use WhatsApp Business API
    console.log('Sending WhatsApp notification:', {
      to: whatsappData.to,
      message: whatsappData.message.substring(0, 50) + '...'
    })

    // Mock WhatsApp sending
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return {
      success: true,
      message: 'WhatsApp message sent successfully',
      messageId: `wa_${Date.now()}`
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}