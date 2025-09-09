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
        background="linear-gradient(135deg, #e07a5f 0%, #3d405b 25%, #81b29a 75%, #f2cc8f 100%)"
        backgroundClip="text"
        color="transparent"
        userSelect="none"
        textAlign="center"
        lineHeight={0.8}
        letterSpacing="-0.02em"
        position="absolute"
        bottom="0"
        left="50%"
        transform="translateX(-50%)"
        width="100%"
        css={{
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        ReSchool<Text 
          as="sup" 
          fontSize={{ base: "4vw", md: "3vw" }}
          ml={2}
          fontWeight="300"
          css={{
            color: '#81b29a',
            WebkitTextFillColor: '#81b29a'
          }}
        >©</Text>
      </Text>
    </Box>
  );
}
