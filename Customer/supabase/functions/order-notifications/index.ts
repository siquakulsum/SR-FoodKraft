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
    const { order_id, status, custom_message } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get order details
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

    // Generate notification content based on status
    const notificationContent = generateNotificationContent(status, order, custom_message)

    // Create notification
    const { data: notification } = await supabase
      .from('notifications')
      .insert({
        user_id: order.user_id,
        type: 'order_update',
        title: notificationContent.title,
        message: notificationContent.message,
        data: {
          order_id: order.id,
          order_number: order.order_number,
          status: status,
          total_amount: order.total_amount,
          event_date: order.event_date,
          event_time: order.event_time
        },
        channels: ['in_app', 'email', 'sms']
      })
      .select()
      .single()

    // Send external notifications
    await sendOrderNotifications(supabase, order, notificationContent)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order notifications sent successfully',
        notification
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

function generateNotificationContent(status: string, order: any, customMessage?: string) {
  const customerName = order.user_profiles?.name || 'Customer'
  
  if (customMessage) {
    return {
      title: `Order Update - ${order.order_number}`,
      message: customMessage
    }
  }

  switch (status) {
    case 'placed':
      return {
        title: '🎉 Order Placed Successfully!',
        message: `Hi ${customerName}! Your order ${order.order_number} has been placed successfully. Total: ₹${order.total_amount}. We'll notify you once payment is confirmed.`
      }
    
    case 'paid':
      return {
        title: '✅ Payment Confirmed!',
        message: `Great news ${customerName}! Payment for order ${order.order_number} has been confirmed. Our chefs will start preparing your delicious food soon!`
      }
    
    case 'preparing':
      return {
        title: '👨‍🍳 Order Being Prepared!',
        message: `${customerName}, our expert chefs have started preparing your order ${order.order_number}. Expected delivery: ${order.event_date} at ${order.event_time}. Get ready for an amazing culinary experience!`
      }
    
    case 'out_for_delivery':
      return {
        title: '🚚 Order Out for Delivery!',
        message: `${customerName}, your order ${order.order_number} is on its way! Our delivery team will reach your location soon. Please be available to receive your order.`
      }
    
    case 'delivered':
      return {
        title: '🎊 Order Delivered Successfully!',
        message: `${customerName}, your order ${order.order_number} has been delivered successfully! We hope you enjoy your meal. Please rate your experience and share your feedback.`
      }
    
    case 'cancelled':
      return {
        title: '❌ Order Cancelled',
        message: `${customerName}, your order ${order.order_number} has been cancelled. If you have any questions, please contact our support team. We apologize for any inconvenience.`
      }
    
    default:
      return {
        title: `Order Update - ${order.order_number}`,
        message: `${customerName}, there's an update on your order ${order.order_number}. Please check your order details for more information.`
      }
  }
}

async function sendOrderNotifications(supabase: any, order: any, content: any) {
  try {
    // Get user preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', order.user_id)
      .single()

    // Get user email
    const { data: user } = await supabase.auth.admin.getUserById(order.user_id)

    const promises = []

    // Send email if enabled
    if (preferences?.email_enabled && user?.user?.email) {
      promises.push(
        sendOrderEmail({
          to: user.user.email,
          name: order.user_profiles?.name || 'Customer',
          subject: content.title,
          message: content.message,
          order
        })
      )
    }

    // Send SMS if enabled
    if (preferences?.sms_enabled && order.user_profiles?.phone) {
      promises.push(
        sendOrderSMS({
          to: order.user_profiles.phone,
          message: `${content.title}\n\n${content.message}`,
          order
        })
      )
    }

    await Promise.all(promises)

    // Mark notification as sent
    await supabase
      .from('notifications')
      .update({ is_sent: true })
      .eq('user_id', order.user_id)
      .eq('data->>order_id', order.id)
      .order('created_at', { ascending: false })
      .limit(1)

  } catch (error) {
    console.error('Error sending order notifications:', error)
  }
}

async function sendOrderEmail(emailData: any) {
  console.log('Sending order email:', emailData.subject)
  
  const statusEmojis: { [key: string]: string } = {
    'placed': '🎉',
    'paid': '✅',
    'preparing': '👨‍🍳',
    'out_for_delivery': '🚚',
    'delivered': '🎊',
    'cancelled': '❌'
  }

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; text-align: center;">
        <h1 style="color: #000; margin: 0;">SR FoodKraft</h1>
        <p style="color: #000; margin: 5px 0;">Premium Catering Services</p>
      </div>
      
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Hello ${emailData.name}!</h2>
        <div style="text-align: center; margin: 20px 0;">
          <h1 style="font-size: 48px; margin: 0;">${statusEmojis[emailData.order.status] || '📢'}</h1>
        </div>
        <h3 style="color: #FFD700; text-align: center;">${emailData.subject}</h3>
        <p style="color: #666; line-height: 1.6; text-align: center; font-size: 16px;">${emailData.message}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Order Summary:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Order Number:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${emailData.order.order_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Event Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${emailData.order.event_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Event Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${emailData.order.event_time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; color: #FFD700; font-weight: bold;">₹${emailData.order.total_amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: #28a745; font-weight: bold; text-transform: capitalize;">${emailData.order.status}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://srfoodkraft.com/orders" 
             style="background: #FFD700; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Track Your Order
          </a>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #155724;">
            <strong>Need Help?</strong> Our customer support team is available 24/7 to assist you.
          </p>
        </div>
      </div>
      
      <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
        <p style="margin: 0 0 10px 0;">Contact us for any queries:</p>
        <p style="margin: 0;">📞 +91 98765 43210 | ✉️ info@srfoodkraft.com | 💬 WhatsApp Support</p>
        <p style="margin-top: 15px; font-size: 12px; color: #ccc;">
          © 2025 SR FoodKraft. All rights reserved.
        </p>
      </div>
    </div>
  `

  // Mock successful email sending
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true, messageId: `order_email_${Date.now()}` }
}

async function sendOrderSMS(smsData: any) {
  console.log('Sending order SMS:', smsData.message.substring(0, 50) + '...')
  
  // Format SMS message
  const smsMessage = `
SR FoodKraft Update:

${smsData.message}

Order: ${smsData.order.order_number}
Event: ${smsData.order.event_date} at ${smsData.order.event_time}
Total: ₹${smsData.order.total_amount}

Track: https://srfoodkraft.com/orders
Support: +91 98765 43210
  `.trim()

  // Mock SMS sending
  await new Promise(resolve => setTimeout(resolve, 300))
  return { success: true, messageId: `order_sms_${Date.now()}` }
}