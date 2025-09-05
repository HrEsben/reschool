"use client";

import { useUser } from "@stackframe/stack";
import { 
  Box, 
  HStack, 
  Heading, 
  Button, 
  VStack,
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  IconButton,
  Text,
  Link
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserAvatar } from "./user-avatar";

export function Header() {
  const user = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Indstillinger", href: "/settings" },
  ];

  const handleMenuItemClick = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  const HamburgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <Box 
      borderBottomWidth={1} 
      className="border-eggshell-400 bg-white"
      px={8} 
      py={4}
      position="sticky"
      top={0}
      zIndex={100}
      width="100%"
      backdropFilter="blur(8px)"
    >
      <HStack justify="space-between" maxW="7xl" mx="auto" position="relative">
        {/* Logo */}
        <Heading size="lg" className="text-delft-blue-500" fontWeight="700" letterSpacing="-0.02em">
          ReSchool
        </Heading>
        
        {/* Desktop Navigation */}
        <HStack gap={6} display={{ base: "none", md: "flex" }}>
          {user && menuItems.map((item) => (
            <Link
              key={item.href}
              onClick={() => router.push(item.href)}
              fontSize="sm"
              fontWeight="500"
              className="text-delft-blue-600 hover:text-delft-blue-500 hover:bg-cambridge-blue-900 focus:bg-cambridge-blue-800 focus:text-delft-blue-500"
              _hover={{ 
                textDecoration: "none",
                transform: "translateY(-1px)"
              }}
              cursor="pointer"
              transition="all 0.2s ease"
              px={3}
              py={2}
              borderRadius="md"
            >
              {item.label}
            </Link>
          ))}
        </HStack>

        {/* Right side items */}
        <HStack gap={3}>
          {/* Mobile menu button */}
          {user && (
            <IconButton
              aria-label="Åbn menu"
              onClick={() => setIsMenuOpen(true)}
              variant="ghost"
              display={{ base: "flex", md: "none" }}
              className="text-delft-blue-500 hover:bg-cambridge-blue-900"
              size="sm"
            >
              <HamburgerIcon />
            </IconButton>
          )}
          
          {/* User Avatar */}
          <Box position="relative">
            {user && <UserAvatar />}
          </Box>
        </HStack>
      </HStack>

      {/* Mobile Drawer Menu */}
      <DrawerRoot 
        open={isMenuOpen} 
        onOpenChange={(details: any) => setIsMenuOpen(details.open)}
        placement="end"
      >
        <DrawerBackdrop />
        <DrawerContent maxW="280px" bg="bg.surface">
          <DrawerHeader borderBottomWidth={1} borderColor="border.muted">
            <HStack justify="space-between" align="center">
              <Heading size="md" color="navy.800" fontWeight="600">
                Menu
              </Heading>
              <IconButton
                aria-label="Luk menu"
                onClick={() => setIsMenuOpen(false)}
                variant="ghost"
                size="sm"
                colorPalette="gray"
              >
                <CloseIcon />
              </IconButton>
            </HStack>
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <VStack gap={0} align="stretch">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  onClick={() => handleMenuItemClick(item.href)}
                  variant="ghost"
                  justifyContent="flex-start"
                  h="auto"
                  p={4}
                  borderRadius={0}
                  fontWeight="500"
                  fontSize="md"
                  color="fg.default"
                  _hover={{ 
                    bg: "cream.100",
                    color: "navy.700"
                  }}
                  _active={{ bg: "cream.200" }}
                  borderBottomWidth={1}
                  borderColor="border.muted"
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Logout button in mobile menu */}
              <Button
                onClick={() => {
                  user?.signOut();
                  setIsMenuOpen(false);
                }}
                variant="ghost"
                justifyContent="flex-start"
                h="auto"
                p={4}
                borderRadius={0}
                fontWeight="500"
                fontSize="md"
                color="coral.600"
                _hover={{ 
                  bg: "coral.50",
                  color: "coral.700"
                }}
                _active={{ bg: "coral.100" }}
              >
                Log ud
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  );
}
