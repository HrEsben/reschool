"use client";

import { useUser } from "@stackframe/stack";
import { Box, Button, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  const user = useUser();

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p={8}
    >
      <VStack gap={8} textAlign="center">
        <Heading size="2xl" color="blue.600">
          Welcome to ReSchool
        </Heading>
        
        {user ? (
          <VStack gap={4}>
            <Text fontSize="lg">
              Hello, {user.displayName || user.primaryEmail}!
            </Text>
            
            <Box 
              p={4} 
              borderWidth={1} 
              borderRadius="lg" 
              textAlign="center"
            >
              <Text fontWeight="bold" mb={2}>
                {user.displayName || "No name set"}
              </Text>
              <Text color="gray.600">
                {user.primaryEmail}
              </Text>
            </Box>
            
            <Button 
              colorScheme="red" 
              onClick={() => user.signOut()}
              size="lg"
            >
              Sign Out
            </Button>
          </VStack>
        ) : (
          <VStack gap={4}>
            <Text fontSize="lg" color="gray.600">
              You are not logged in
            </Text>
            
            <HStack gap={4}>
              <Link href="/handler/sign-in">
                <Button 
                  colorScheme="blue" 
                  size="lg"
                >
                  Sign In
                </Button>
              </Link>
              
              <Link href="/handler/sign-up">
                <Button 
                  variant="outline" 
                  colorScheme="blue" 
                  size="lg"
                >
                  Sign Up
                </Button>
              </Link>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
