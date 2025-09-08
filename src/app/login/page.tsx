"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { stackApp } from "@/stack-client";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Input,
  Link,
  Card
} from "@chakra-ui/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const prefillEmail = searchParams.get('email');

  // Prefill email if provided in URL
  useEffect(() => {
    if (prefillEmail) {
      setEmail(decodeURIComponent(prefillEmail));
    }
  }, [prefillEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await stackApp.signInWithCredential({
        email,
        password,
      });

      if (result.status === "ok") {
        // If there's a redirect URL (like from invitation), go there instead of dashboard
        if (redirect) {
          router.push(redirect);
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Ugyldige loginoplysninger");
      }
    } catch {
      setError("Der opstod en fejl ved login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p={8}
      className="bg-eggshell-900"
    >
      <Card.Root maxW="md" w="full" variant="outline" className="border-eggshell-400">
        <Card.Body p={8}>
          <VStack gap={6} align="stretch">
            {/* Logo */}
            <Heading 
              size="xl" 
              textAlign="center"
              fontWeight="700" 
              letterSpacing="-0.02em"
              style={{
                background: 'linear-gradient(135deg, #e07a5f 0%, #3d405b 25%, #81b29a 75%, #f2cc8f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ReSchool<Text 
                as="sup" 
                fontSize="xs" 
                ml={0.5}
                fontWeight="300"
                style={{
                  color: '#81b29a',
                  WebkitTextFillColor: '#81b29a'
                }}
              >©</Text>
            </Heading>

            <Text textAlign="center" className="text-delft-blue-600" fontSize="lg">
              Log ind på din konto
            </Text>

            {error && (
              <Box bg="#fdf2f2" border="1px solid #f56565" borderRadius="md" p={3}>
                <Text color="#c53030" fontSize="sm">{error}</Text>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="500" className="text-delft-blue-600">Email</Text>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.dk"
                    bg="white"
                    className="border-eggshell-400"
                    _focus={{
                      borderColor: '#81b29a',
                      shadow: '0 0 0 1px #81b29a'
                    }}
                    required
                  />
                  {prefillEmail && (
                    <Text fontSize="sm" color="#81b29a" mt={1}>
                      ✉️ Email fra invitation
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text mb={2} fontWeight="500" className="text-delft-blue-600">Adgangskode</Text>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Din adgangskode"
                    bg="white"
                    className="border-eggshell-400"
                    _focus={{
                      borderColor: '#81b29a',
                      shadow: '0 0 0 1px #81b29a'
                    }}
                    required
                  />
                </Box>

                <Button
                  type="submit"
                  bg="#81b29a"
                  color="white"
                  _hover={{ bg: "#6da085" }}
                  size="lg"
                  fontWeight="600"
                  loading={isLoading}
                  disabled={isLoading}
                  mt={2}
                >
                  {isLoading ? "Logger ind..." : "Log ind"}
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" className="text-delft-blue-600" fontSize="sm">
              Har du ikke en konto?{" "}
              <Link
                href="/signup"
                className="text-cambridge-blue-500 hover:text-cambridge-blue-400"
                fontWeight="600"
              >
                Opret bruger
              </Link>
            </Text>

            <Text textAlign="center" fontSize="sm">
              <Link
                href="/"
                className="text-delft-blue-500 hover:text-delft-blue-400"
              >
                ← Tilbage til forsiden
              </Link>
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
