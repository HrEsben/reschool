'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from '../../app/actions'
import { Box, Button, Input, Text, VStack, HStack } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { Bell } from 'lucide-react'

// Helper function to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
 
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      console.log('Registering service worker...')
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      
      console.log('Service worker registered successfully:', registration)
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready
      
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      console.log('Current subscription:', sub)
    } catch (error) {
      console.error('Service worker registration failed:', error)
      toaster.create({
        title: 'Fejl',
        description: 'Kunne ikke registrere service worker',
        type: 'error',
        duration: 5000,
      })
    }
  }

  async function subscribeToPush() {
    setIsLoading(true)
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        toaster.create({
          title: 'Tilladelse nægtet',
          description: 'Push notifikationer kræver tilladelse',
          type: 'warning',
          duration: 5000,
        })
        return
      }

      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
      
      toaster.create({
        title: 'Succes!',
        description: 'Du er nu tilmeldt push notifikationer',
        type: 'success',
        duration: 5000,
      })
    } catch (error) {
      console.error('Push subscription failed:', error)
      toaster.create({
        title: 'Fejl',
        description: 'Kunne ikke tilmelde push notifikationer',
        type: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true)
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
      
      toaster.create({
        title: 'Afmeldt',
        description: 'Du er nu afmeldt push notifikationer',
        type: 'info',
        duration: 5000,
      })
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      toaster.create({
        title: 'Fejl',
        description: 'Kunne ikke afmelde push notifikationer',
        type: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function sendTestNotification() {
    if (!message.trim()) {
      toaster.create({
        title: 'Fejl',
        description: 'Skriv en besked først',
        type: 'warning',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    try {
      await sendNotification(message)
      setMessage('')
      
      toaster.create({
        title: 'Sendt!',
        description: 'Test notifikation er sendt',
        type: 'success',
        duration: 5000,
      })
    } catch (error) {
      console.error('Send notification failed:', error)
      toaster.create({
        title: 'Fejl',
        description: 'Kunne ikke sende notifikation',
        type: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
        <Text color="gray.600">
          Push notifikationer understøttes ikke i denne browser.
        </Text>
      </Box>
    )
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <VStack gap={4} align="stretch">
        <HStack gap={2}>
          <Bell size={20} />
          <Text fontSize="lg" fontWeight="bold">
            Push Notifikationer
          </Text>
        </HStack>
        
        {subscription ? (
          <VStack gap={3} align="stretch">
            <Text color="green.600" fontSize="sm">
              ✅ Du er tilmeldt push notifikationer
            </Text>
            
            <Button 
              onClick={unsubscribeFromPush} 
              colorScheme="red" 
              variant="outline"
              loading={isLoading}
              loadingText="Afmelder..."
            >
              Afmeld notifikationer
            </Button>
            
            <Box>
              <Text mb={2} fontSize="sm" fontWeight="medium">
                Send test notifikation:
              </Text>
              <VStack gap={2}>
                <Input
                  placeholder="Skriv din besked her..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendTestNotification()
                    }
                  }}
                />
                <Button 
                  onClick={sendTestNotification}
                  colorScheme="blue"
                  size="sm"
                  disabled={!message.trim()}
                  loading={isLoading}
                  loadingText="Sender..."
                >
                  Send test besked
                </Button>
              </VStack>
            </Box>
          </VStack>
        ) : (
          <VStack gap={3} align="stretch">
            <Text color="gray.600" fontSize="sm">
              Du er ikke tilmeldt push notifikationer
            </Text>
            <Button 
              onClick={subscribeToPush}
              colorScheme="blue"
              loading={isLoading}
              loadingText="Tilmelder..."
            >
              <HStack gap={2}>
                <Bell size={16} />
                <Text>Tilmeld notifikationer</Text>
              </HStack>
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
