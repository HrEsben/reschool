// Notification listener service that listens for PostgreSQL notifications
// and sends real-time push notifications to subscribed users using native Web Push API

import dotenv from 'dotenv'
import { Client } from 'pg'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface NotificationPayload {
  type: string
  child_id?: number
  child_name?: string
  tool_id?: number
  tool_name?: string
  entry_id?: number
  step_id?: number
  value?: number
  smiley?: string
  puttetid?: string
  completed?: boolean
  timestamp: string
}

interface NotificationContent {
  title: string
  body: string
  icon: string
  data: Record<string, unknown>
}

interface PushSubscription {
  id: number
  user_id: number
  endpoint: string
  p256dh: string
  auth: string
  created_at: Date
}

class NotificationListener {
  private client: Client
  private pushClient: Client
  
  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    
    this.pushClient = new Client({
      connectionString: process.env.DATABASE_URL,
    })
  }

  async start() {
    try {
      // Connect to PostgreSQL
      await this.client.connect()
      await this.pushClient.connect()
      
      console.log('🔔 Notification listener started')
      
      // Set up listeners for different notification channels
      this.client.on('notification', this.handleNotification.bind(this) as any)
      
      // Listen to all our notification channels
      await this.client.query('LISTEN new_registration')
      await this.client.query('LISTEN tool_update')
      await this.client.query('LISTEN sengetid_entry')
      await this.client.query('LISTEN barometer_entry')
      await this.client.query('LISTEN smiley_entry')
      await this.client.query('LISTEN indsatstrappe_update')
      
      console.log('📡 Listening for database notifications...')
      
    } catch (error) {
      console.error('❌ Failed to start notification listener:', error)
      throw error
    }
  }

  private async handleNotification(msg: { channel: string; payload: string }) {
    try {
      console.log('📢 Received notification:', msg.channel, msg.payload)
      
      const payload: NotificationPayload = JSON.parse(msg.payload)
      
      // Generate notification content based on type
      const notificationContent = this.generateNotificationContent(payload)
      
      if (notificationContent) {
        // Send push notifications to relevant users
        await this.sendPushNotifications(payload, notificationContent)
      }
      
    } catch (error) {
      console.error('❌ Error handling notification:', error)
    }
  }

  private generateNotificationContent(payload: NotificationPayload) {
    switch (payload.type) {
      case 'new_child':
        return {
          title: '👶 Nyt barn registreret',
          body: `${payload.child_name} er blevet tilføjet`,
          icon: '/android-chrome-192x192.png',
          data: { url: '/', type: 'new_child', childId: payload.child_id }
        }
        
      case 'tool_update':
        return {
          title: '🔧 Værktøj opdateret',
          body: `${payload.tool_name} er blevet opdateret`,
          icon: '/android-chrome-192x192.png',
          data: { url: '/', type: 'tool_update', toolId: payload.tool_id }
        }
        
      case 'sengetid_entry':
        return {
          title: '🛏️ Ny sengetid registreret',
          body: `Puttetid: ${payload.puttetid}`,
          icon: '/android-chrome-192x192.png',
          data: { url: '/', type: 'sengetid', childId: payload.child_id }
        }
        
      case 'barometer_entry':
        return {
          title: '📊 Nyt barometer-input',
          body: `Værdi: ${payload.value}`,
          icon: '/android-chrome-192x192.png',
          data: { url: '/', type: 'barometer', childId: payload.child_id }
        }
        
      case 'smiley_entry':
        return {
          title: '😊 Dagens smiley registreret',
          body: `Smiley: ${payload.smiley}`,
          icon: '/android-chrome-192x192.png',
          data: { url: '/', type: 'smiley', childId: payload.child_id }
        }
        
      case 'indsatstrappe_step':
        return {
          title: '🪜 Indsatstrappe opdateret',
          body: payload.completed ? 'Trin fuldført!' : 'Trin markeret som ikke fuldført',
          icon: '/android-chrome-192x192.png',
          data: { url: '/', type: 'indsatstrappe', childId: payload.child_id }
        }
        
      default:
        return null
    }
  }

  private async sendPushNotifications(payload: NotificationPayload, content: NotificationContent) {
    try {
      // Get all push subscriptions for users related to this child
      let subscriptions: PushSubscription[] = []
      
      if (payload.child_id) {
        // Get subscriptions for users who have access to this child
        const result = await this.pushClient.query(`
          SELECT DISTINCT ps.* 
          FROM push_subscriptions ps
          JOIN child_users cu ON ps.user_id = cu.user_id
          WHERE cu.child_id = $1
        `, [payload.child_id])
        
        subscriptions = result.rows
      } else {
        // For general notifications, send to all subscribed users
        const result = await this.pushClient.query('SELECT * FROM push_subscriptions')
        subscriptions = result.rows
      }
      
      console.log(`📤 Sending push notifications to ${subscriptions.length} users`)
      
      // Send push notification to each subscription using our native implementation
      const promises = subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }
          
          // Use our native Web Push implementation
          await this.sendNativePushNotification(pushSubscription, content)
          
          console.log(`✅ Push notification sent to user ${subscription.user_id}`)
        } catch (error: any) {
          console.error(`❌ Failed to send push notification to user ${subscription.user_id}:`, error)
          
          // If the subscription is invalid, remove it from the database
          if (error?.status === 410 || error?.statusCode === 410) {
            await this.pushClient.query(
              'DELETE FROM push_subscriptions WHERE id = $1',
              [subscription.id]
            )
            console.log(`🗑️ Removed invalid subscription for user ${subscription.user_id}`)
          }
        }
      })
      
      await Promise.allSettled(promises)
      
    } catch (error) {
      console.error('❌ Error sending push notifications:', error)
    }
  }

  private async sendNativePushNotification(subscription: Record<string, unknown>, payload: NotificationContent) {
    // For now, log the notification instead of implementing full VAPID
    // This matches our current native approach in actions.ts
    console.log('📱 Would send native push notification:', {
      endpoint: subscription.endpoint,
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString()
    })
    
    // TODO: Implement full native Web Push Protocol with VAPID authentication
    // This requires implementing the crypto signatures according to RFC 8291
    // For now, this is a placeholder that demonstrates the structure
    
    return { success: true }
  }

  async stop() {
    try {
      await this.client.end()
      await this.pushClient.end()
      console.log('🔴 Notification listener stopped')
    } catch (error) {
      console.error('❌ Error stopping notification listener:', error)
    }
  }
}

export default NotificationListener

// If this file is run directly, start the listener
if (require.main === module) {
  const listener = new NotificationListener()
  
  listener.start().catch((error) => {
    console.error('❌ Failed to start notification listener:', error)
    process.exit(1)
  })
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...')
    await listener.stop()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
    await listener.stop()
    process.exit(0)
  })
}
