"use client"

import { useState, useEffect } from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { system } from "./theme"
import { SimpleToaster } from "./simple-toast"
import { queryClient } from "@/lib/query-client"
import { ServiceWorkerProvider } from "@/hooks/use-service-worker"

export function Provider(props: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ServiceWorkerProvider>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          {!mounted ? (
            <div suppressHydrationWarning>
              {props.children}
            </div>
          ) : (
            <>
              {props.children}
              <SimpleToaster />
            </>
          )}
        </ChakraProvider>
        {mounted && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ServiceWorkerProvider>
  )
}
