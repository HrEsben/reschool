"use client"

import { useState, useEffect } from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { system } from "./theme"
import { SimpleToaster } from "./simple-toast"
import { queryClient } from "@/lib/query-client"
import { ServiceWorkerProvider } from "@/hooks/use-service-worker"
import { CacheDebugger } from "@/components/debug/cache-debugger"

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
          <CacheDebugger />
        </ChakraProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ServiceWorkerProvider>
  )
}
