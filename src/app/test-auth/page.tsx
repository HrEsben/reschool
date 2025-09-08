"use client";

import { useUser } from "@stackframe/stack";
import { Box, Heading, Text, VStack, Button, Code } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestAuthPage() {
  const user = useUser(); // No redirect - just get user state
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`User state changed: ${user === undefined ? 'loading' : user === null ? 'not authenticated' : 'authenticated'}`);
    if (user) {
      addLog(`User ID: ${user.id}, Email: ${user.primaryEmail}`);
    }
  }, [user]);

  useEffect(() => {
    addLog(`Page loaded at ${window.location.href}`);
  }, []);

  return (
    <Box p={8} maxW="4xl" mx="auto">
      <VStack gap={6} align="stretch">
        <Heading>Authentication Test Page</Heading>
        
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>Current Status:</Text>
          <Text>
            User: {user === undefined ? "Loading..." : user === null ? "Not authenticated" : `Authenticated as ${user.primaryEmail}`}
          </Text>
        </Box>

        <VStack gap={2} align="stretch">
          <Button onClick={() => { addLog("Navigating to /handler/sign-in"); router.push("/handler/sign-in"); }}>
            Go to Sign In (/handler/sign-in)
          </Button>
          <Button onClick={() => { addLog("Navigating to /handler/sign-up"); router.push("/handler/sign-up"); }}>
            Go to Sign Up (/handler/sign-up)
          </Button>
          <Button onClick={() => { addLog("Navigating to /"); router.push("/"); }}>
            Go to Home (/)
          </Button>
          <Button onClick={() => { addLog("Navigating to /dashboard"); router.push("/dashboard"); }}>
            Go to Dashboard (/dashboard) - Should redirect if not authenticated
          </Button>
          {user && (
            <Button onClick={() => { addLog("Signing out"); router.push("/handler/sign-out"); }}>
              Sign Out
            </Button>
          )}
        </VStack>

        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>Debug Logs:</Text>
          <Code p={4} display="block" whiteSpace="pre-wrap" maxH="300px" overflow="auto">
            {logs.join('\n')}
          </Code>
          <Button size="sm" mt={2} onClick={() => setLogs([])}>Clear Logs</Button>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">
            This page is completely public and doesn&apos;t force any redirects. Use it to test the authentication flow.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
