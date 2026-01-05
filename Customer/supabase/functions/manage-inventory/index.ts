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
    const { action, menu_item_id, quantity, date } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let result

    switch (action) {
      case 'check_availability':
        result = await checkAvailability(supabase, menu_item_id, quantity, date)
        break
      
      case 'reserve_items':
        result = await reserveItems(supabase, menu_item_id, quantity, date)
        break
      
      case 'update_availability':
        result = await updateAvailability(supabase, menu_item_id, date)
        break
      
      case 'get_daily_capacity':
        result = await getDailyCapacity(supabase, date)
        break
      
      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result
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

async function checkAvailability(supabase: any, menuItemId: string, quantity: number, date: string) {
  // Get menu item details
  const { data: menuItem, error: menuError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', menuItemId)
    .single()

  if (menuError || !menuItem) {
    throw new Error('Menu item not found')
  }

  if (!menuItem.is_available) {
    return {
      available: false,
      reason: 'Item is currently unavailable'
    }
  }

  // Check if quantity meets minimum requirement
  if (quantity < menuItem.min_quantity) {
    return {
      available: false,
      reason: `Minimum quantity required: ${menuItem.min_quantity}`
    }
  }

  // Check daily capacity for the item
  const { data: orders } = await supabase
    .from('order_items')
    .select(`
      quantity,
      orders!inner (
        event_date,
        status
      )
    `)
    .eq('menu_item_id', menuItemId)
    .eq('orders.event_date', date)
    .in('orders.status', ['placed', 'paid', 'preparing'])

  const totalOrdered = orders?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
  const dailyCapacity = getDailyCapacityForItem(menuItem.category_id)
  
  if (totalOrdered + quantity > dailyCapacity) {
    return {
      available: false,
      reason: `Daily capacity exceeded. Available: ${dailyCapacity - totalOrdered}`,
      availableQuantity: Math.max(0, dailyCapacity - totalOrdered)
    }
  }

  return {
    available: true,
    availableQuantity: dailyCapacity - totalOrdered
  }
}

async function reserveItems(supabase: any, menuItemId: string, quantity: number, date: string) {
  // This would typically create a temporary reservation
  // For now, we'll just log the reservation
  console.log(`Reserving ${quantity} units of item ${menuItemId} for ${date}`)
  
  return {
    reserved: true,
    reservationId: `res_${Date.now()}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
  }
}

async function updateAvailability(supabase: any, menuItemId: string, date: string) {
  // Check current orders and update availability
  const availability = await checkAvailability(supabase, menuItemId, 0, date)
  
  // Update menu item availability if needed
  if (!availability.available && availability.reason === 'Daily capacity exceeded') {
    await supabase
      .from('menu_items')
      .update({ is_available: false })
      .eq('id', menuItemId)
  }

  return availability
}

async function getDailyCapacity(supabase: any, date: string) {
  // Get all orders for the date
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        menu_item_id,
        quantity,
        menu_items (
          name,
          category_id
        )
      )
    `)
    .eq('event_date', date)
    .in('status', ['placed', 'paid', 'preparing'])

  // Calculate capacity usage by category
  const capacityByCategory: { [key: string]: number } = {}
  
  orders?.forEach((order: any) => {
    order.order_items.forEach((item: any) => {
      const categoryId = item.menu_items.category_id
      if (!capacityByCategory[categoryId]) {
        capacityByCategory[categoryId] = 0
      }
      capacityByCategory[categoryId] += item.quantity
    })
  })

  return {
    date,
    totalOrders: orders?.length || 0,
    capacityByCategory,
    recommendations: generateCapacityRecommendations(capacityByCategory)
  }
}

function getDailyCapacityForItem(categoryId: string): number {
  // Define daily capacity limits by category
  const capacityLimits: { [key: string]: number } = {
    'starters': 50,      // 50kg total starters per day
    'main-course': 100,  // 100kg total main course per day
    'rice-biryani': 80,  // 80kg total rice/biryani per day
    'gravies': 60,       // 60kg total gravies per day
    'breads': 500,       // 500 pieces total breads per day
    'desserts': 30,      // 30kg total desserts per day
    'beverages': 200     // 200 pieces total beverages per day
  }

  return capacityLimits[categoryId] || 50 // Default capacity
}

function generateCapacityRecommendations(capacityByCategory: { [key: string]: number }) {
  const recommendations = []
  
  Object.entries(capacityByCategory).forEach(([categoryId, used]) => {
    const limit = getDailyCapacityForItem(categoryId)
    const utilization = (used / limit) * 100
    
    if (utilization > 80) {
      recommendations.push({
        category: categoryId,
        message: `High demand (${utilization.toFixed(1)}% capacity used)`,
        suggestion: 'Consider increasing preparation or limiting orders'
      })
    } else if (utilization < 20) {
      recommendations.push({
        category: categoryId,
        message: `Low demand (${utilization.toFixed(1)}% capacity used)`,
        suggestion: 'Consider promotional offers or menu adjustments'
      })
    }
  })

  return recommendations
}