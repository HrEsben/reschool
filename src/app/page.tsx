"use client";

import { useUser } from "@stackframe/stack";
import { Box, Button, Heading, Text, VStack, HStack, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const user = useUser();
  const router = useRouter();

  // Utility function to generate user slug
  const generateUserSlug = (email: string, displayName?: string) => {
    const generateSlug = (text: string) => {
      return text.toLowerCase()
        .replace(/[æå]/g, 'a')
        .replace(/[ø]/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    return displayName 
      ? generateSlug(displayName)
      : generateSlug(email.split('@')[0]);
  };

  // Redirect based on user state
  useEffect(() => {
    if (user) {
      // Check if user has a display name set
      if (!user.displayName || user.displayName.trim() === '') {
        // First time user - redirect to user profile to set name
        const userSlug = generateUserSlug(user.primaryEmail || '', user.displayName || undefined);
        router.push(`/users/${userSlug}?firstTime=true`);
      } else {
        // User has name set - go to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, router]);

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p={8}
      className="bg-eggshell-900"
    >
      <VStack gap={8} textAlign="center">
        <Heading 
          size="4xl" 
          fontWeight="900"
          letterSpacing="-0.05em"
          style={{
            background: 'linear-gradient(135deg, #e07a5f 0%, #3d405b 25%, #81b29a 75%, #f2cc8f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontStretch: 'condensed'
          }}
        >
          ReSchool<Text 
            as="span"
            fontSize="xs" 
            ml={0.5}
            fontWeight="300"
            style={{
              color: '#81b29a',
              WebkitTextFillColor: '#81b29a',
              verticalAlign: 'super',
              fontSize: '0.5em',
              lineHeight: '1'
            }}
          >©</Text>
        </Heading>
        
        {user === undefined ? (
          // Loading state
          <VStack gap={4}>
            <Spinner size="lg" className="text-delft-blue-500" />
            <Text className="text-delft-blue-600">Indlæser...</Text>
          </VStack>
        ) : user === null ? (
          // Not authenticated - show login/signup
          <VStack gap={6}>
            <Text fontSize="lg" className="text-delft-blue-600" maxW="md" textAlign="center" lineHeight="1.6">
              En tryg vej tilbage i skole for børn med ufrivilligt skolefravær
            </Text>
            
            <HStack gap={4}>
              <Link href="/login">
                <Button 
                  bg="#81b29a"
                  color="white"
                  _hover={{ bg: "#6da085" }}
                  size="lg"
                  fontWeight="600"
                >
                  Log ind
                </Button>
              </Link>
              
              <Link href="/signup">
                <Button 
                  variant="outline"
                  borderColor="#f2cc8f"
                  color="#d4a574"
                  _hover={{ 
                    bg: "#f2cc8f", 
                    color: "#8b6914",
                    borderColor: "#f2cc8f"
                  }}
                  size="lg"
                  fontWeight="600"
                >
                  Opret bruger
                </Button>
              </Link>
            </HStack>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}
