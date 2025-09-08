"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"
import { system } from "./theme"
import { SimpleToaster } from "./simple-toast"

export function Provider(props: { children: React.ReactNode }) {
  return (
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
  )
}
