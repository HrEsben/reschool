"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { system } from "./theme"
import { SimpleToaster } from "./simple-toast"
import { queryClient } from "@/lib/query-client"

export function Provider(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <ThemeProvider 
          attribute="class" 
          disableTransitionOnChange
          forcedTheme="light"
          defaultTheme="light"
        >
          {props.children}
          <SimpleToaster />
        </ThemeProvider>
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
