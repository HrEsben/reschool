"use client";

import { Box, Text } from "@chakra-ui/react";

export default function RisingFooter() {
  return (
    <Box
      position="sticky"
      bottom={0}
      mt="-30vh"
      height={{ base: "30vh", md: "50vh" }}
      bg="white"
      overflow="hidden"
    >
      <Text
        fontSize={{ base: "15vw", md: "12vw" }}
        fontWeight="700"
        textAlign="center"
        lineHeight={0.8}
        letterSpacing="-0.02em"
        position="absolute"
        bottom="0"
        left="50%"
        transform="translateX(-50%)"
        width="100%"
        userSelect="none"
        style={{
          background: 'linear-gradient(135deg, #e07a5f 0%, #3d405b 25%, #81b29a 75%, #f2cc8f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        ReSchool<Text 
          as="sup" 
          fontSize={{ base: "3vw", md: "2vw" }}
          ml={0.5}
          fontWeight="300"
          style={{
            color: '#81b29a',
            WebkitTextFillColor: '#81b29a'
          }}
        >©</Text>
      </Text>
    </Box>
  );
}
