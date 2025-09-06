"use client"

import { useState, useEffect } from 'react'
import { Box, Text, HStack, Icon } from '@chakra-ui/react'

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  isVisible?: boolean
}

let toastId = 0
let setToastsExternal: ((callback: (toasts: Toast[]) => Toast[]) => void) | null = null

export const showToast = (toast: Omit<Toast, 'id' | 'isVisible'>) => {
  const id = (++toastId).toString()
  const newToast: Toast = { ...toast, id, isVisible: false }
  
  if (setToastsExternal) {
    // Add toast in hidden state first
    setToastsExternal((prev: Toast[]) => [...prev, newToast])
    
    // Then make it visible for animation
    setTimeout(() => {
      if (setToastsExternal) {
        setToastsExternal((prev: Toast[]) => 
          prev.map((t: Toast) => t.id === id ? { ...t, isVisible: true } : t)
        )
      }
    }, 10)
    
    // Auto remove after duration
    setTimeout(() => {
      if (setToastsExternal) {
        // First hide it
        setToastsExternal((prev: Toast[]) => 
          prev.map((t: Toast) => t.id === id ? { ...t, isVisible: false } : t)
        )
        // Then remove it after animation
        setTimeout(() => {
          if (setToastsExternal) {
            setToastsExternal((prev: Toast[]) => prev.filter((t: Toast) => t.id !== id))
          }
        }, 300)
      }
    }, toast.duration || 3000)
  }
}

export const SimpleToaster = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  useEffect(() => {
    setToastsExternal = setToasts
    return () => {
      setToastsExternal = null
    }
  }, [])

  const removeToast = (id: string) => {
    // First hide it with animation
    setToasts(prev => prev.map(t => t.id === id ? { ...t, isVisible: false } : t))
    // Then remove it after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }

  const getToastColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return { bg: '#81b29a', color: 'white' }
      case 'error':
        return { bg: '#e07a5f', color: 'white' }
      case 'warning':
        return { bg: '#f2cc8f', color: '#3d405b' }
      default:
        return { bg: '#f4f1de', color: '#3d405b' }
    }
  }

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  if (toasts.length === 0) return null

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      zIndex={9999}
      display="flex"
      flexDirection="column"
      gap={2}
      maxW="400px"
    >
      {toasts.map((toast) => {
        const colors = getToastColors(toast.type)
        return (
          <Box
            key={toast.id}
            bg={colors.bg}
            color={colors.color}
            p={4}
            borderRadius="md"
            boxShadow="lg"
            border="1px solid"
            borderColor="rgba(0,0,0,0.1)"
            cursor="pointer"
            onClick={() => removeToast(toast.id)}
            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            transform={toast.isVisible ? "translateX(0)" : "translateX(100%)"}
            opacity={toast.isVisible ? 1 : 0}
          >
            <HStack gap={3} align="start">
              <Icon mt={0.5}>
                {getIcon(toast.type)}
              </Icon>
              <Box flex={1}>
                <Text fontWeight="600" fontSize="sm">
                  {toast.title}
                </Text>
                {toast.description && (
                  <Text fontSize="xs" mt={1} opacity={0.9}>
                    {toast.description}
                  </Text>
                )}
              </Box>
            </HStack>
          </Box>
        )
      })}
    </Box>
  )
}
