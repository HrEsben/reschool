"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { system } from "./theme"
import { SimpleToaster } from "./simple-toast"
import { queryClient } from "@/lib/query-client"
import { ServiceWorkerProvider } from "@/hooks/use-service-worker"
import { CacheDebugger } from "@/components/debug/cache-debugger"
import { useEffect, useState } from "react"

export function Provider(props: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ServiceWorkerProvider>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          {mounted ? (
            <ThemeProvider 
              attribute="class" 
              disableTransitionOnChange
              forcedTheme="light"
              defaultTheme="light"
            >
              {props.children}
              <SimpleToaster />
              <CacheDebugger />
            </ThemeProvider>
          ) : (
                      <div suppressHydrationWarning>
            {props.children}
            <SimpleToaster />
            <CacheDebugger />
          </div>
          )}
        </ChakraProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ServiceWorkerProvider>
  )
}
