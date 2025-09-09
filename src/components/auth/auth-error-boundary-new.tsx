"use client";

import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  // Simple wrapper - auth handling is done at page level with Suspense
  return <>{children}</>;
}
