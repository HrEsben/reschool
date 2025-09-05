import { Box, Spinner, Text } from "@chakra-ui/react";

export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      flexDirection="column"
      gap={4}
    >
      <Spinner size="xl" color="blue.500" />
      <Text color="gray.600" fontSize="lg">
        Indlæser...
      </Text>
    </Box>
  );
}
