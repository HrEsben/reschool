"use client";

import { Box } from "@chakra-ui/react";
import { Header } from "./header";
import { memo } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const AppLayout = memo(function AppLayout({ 
  children, 
  showHeader = true 
}: AppLayoutProps) {
  return (
    <Box minH="100vh" className="bg-eggshell-900">
      {showHeader && <Header />}
      <Box>
        {children}
      </Box>
    </Box>
  );
});
