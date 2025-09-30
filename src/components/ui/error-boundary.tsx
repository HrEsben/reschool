'use client';

import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          minH="50vh" 
          p={8}
          textAlign="center"
        >
          <div>
            <Heading size="lg" mb={4}>Noget gik galt</Heading>
            <Text mb={6} color="gray.600">
              Der opstod en uventet fejl. Prøv at genindlæse siden.
            </Text>
            <Button onClick={this.retry} colorScheme="blue">
              Prøv igen
            </Button>
          </div>
        </Box>
      );
    }

    return this.props.children;
  }
}