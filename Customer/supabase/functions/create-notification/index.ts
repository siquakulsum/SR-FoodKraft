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
    const { 
      user_id, 
      type, 
      title, 
      message, 
      data = {}, 
      channels = ['in_app'],
      send_immediately = true 
    } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single()

    // Check if user wants this type of notification
    if (preferences) {
      const shouldSend = checkNotificationPreferences(type, preferences)
      if (!shouldSend) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Notification skipped due to user preferences'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create in-app notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        channels,
        is_sent: false
      })
      .select()
      .single()

    if (error) throw error

    // Send external notifications if requested
    if (send_immediately && channels.length > 1) {
      await sendExternalNotifications(
        supabase,
        user_id,
        notification,
        channels,
        preferences
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification,
        message: 'Notification created successfully'
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

function checkNotificationPreferences(type: string, preferences: any): boolean {
  switch (type) {
    case 'order_update':
      return preferences.order_updates
    case 'promotion':
      return preferences.promotions
    case 'system':
      return preferences.system_alerts
    case 'welcome':
      return true // Always send welcome notifications
    default:
      return true
  }
}

async function sendExternalNotifications(
  supabase: any,
  userId: string,
  notification: any,
  channels: string[],
  preferences: any
) {
  try {
    // Get user profile for contact info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name, phone')
      .eq('id', userId)
      .single()

    const { data: user } = await supabase.auth.admin.getUserById(userId)

    const promises = []

    // Send email if enabled
    if (channels.includes('email') && preferences?.email_enabled && user?.user?.email) {
      promises.push(
        sendEmailNotification({
          to: user.user.email,
          name: profile?.name || 'Customer',
          subject: notification.title,
          message: notification.message,
          data: notification.data
        })
      )
    }

    // Send SMS if enabled
    if (channels.includes('sms') && preferences?.sms_enabled && profile?.phone) {
      promises.push(
        sendSMSNotification({
          to: profile.phone,
          message: `${notification.title}: ${notification.message}`,
          data: notification.data
        })
      )
    }

    // Send push notification if enabled
    if (channels.includes('push') && preferences?.push_enabled) {
      promises.push(
        sendPushNotification({
          userId,
          title: notification.title,
          message: notification.message,
          data: notification.data
        })
      )
    }

    await Promise.all(promises)

    // Mark notification as sent
    await supabase
      .from('notifications')
      .update({ is_sent: true })
      .eq('id', notification.id)

  } catch (error) {
    console.error('Error sending external notifications:', error)
  }
}

async function sendEmailNotification(emailData: any) {
  // In production, integrate with SendGrid, AWS SES, etc.
  console.log('Sending email notification:', emailData.subject)
  
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; text-align: center;">
        <h1 style="color: #000; margin: 0;">SR FoodKraft</h1>
        <p style="color: #000; margin: 5px 0;">Premium Catering Services</p>
      </div>
      
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Hello ${emailData.name}!</h2>
        <h3 style="color: #FFD700;">${emailData.subject}</h3>
        <p style="color: #666; line-height: 1.6;">${emailData.message}</p>
        
        ${emailData.data.order_number ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Order Details:</h4>
            <p><strong>Order Number:</strong> ${emailData.data.order_number}</p>
            ${emailData.data.total_amount ? `<p><strong>Total:</strong> ₹${emailData.data.total_amount}</p>` : ''}
          </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://srfoodkraft.com/orders" 
             style="background: #FFD700; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Orders
          </a>
        </div>
      </div>
      
      <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
        <p>📞 +91 98765 43210 | ✉️ info@srfoodkraft.com</p>
        <p style="margin-top: 15px; font-size: 12px; color: #ccc;">
          © 2025 SR FoodKraft. All rights reserved.
        </p>
      </div>
    </div>
  `

  // Mock successful email sending
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true, messageId: `email_${Date.now()}` }
}

async function sendSMSNotification(smsData: any) {
  // In production, integrate with Twilio, AWS SNS, etc.
  console.log('Sending SMS notification:', smsData.message.substring(0, 50) + '...')
  
  // Mock SMS sending
  await new Promise(resolve => setTimeout(resolve, 300))
  return { success: true, messageId: `sms_${Date.now()}` }
}

async function sendPushNotification(pushData: any) {
  // In production, integrate with Firebase Cloud Messaging, etc.
  console.log('Sending push notification:', pushData.title)
  
  // Mock push notification
  await new Promise(resolve => setTimeout(resolve, 200))
  return { success: true, messageId: `push_${Date.now()}` }
}