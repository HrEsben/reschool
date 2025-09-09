"use client";

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  // Simple wrapper - auth handling is done at page level with Suspense
  return <>{children}</>;
}
