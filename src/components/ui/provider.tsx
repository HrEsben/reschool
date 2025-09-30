"use client"

import { useState, useEffect } from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { system } from "./theme"
import { SimpleToaster } from "./simple-toast"
import { queryClient } from "@/lib/query-client"
import { ServiceWorkerProvider } from "@/hooks/use-service-worker"

export function Provider(props: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <ServiceWorkerProvider>
        <QueryClientProvider client={queryClient}>
          <div suppressHydrationWarning>
            {props.children}
          </div>
        </QueryClientProvider>
      </ServiceWorkerProvider>
    )
  }

  return (
    <ServiceWorkerProvider>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          {props.children}
          <SimpleToaster />
          {process.env.NODE_ENV === 'development' && (
            <>
              {/* Only load debug tools in development */}
            </>
          )}
        </ChakraProvider>
        {process.env.NODE_ENV === 'development' && (
          <div suppressHydrationWarning>
            {/* ReactQueryDevtools dynamically imported only in dev */}
          </div>
        )}
      </QueryClientProvider>
    </ServiceWorkerProvider>
  )
}
