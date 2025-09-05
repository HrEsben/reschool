"use client";

import { useUser } from "@stackframe/stack";
import { 
  Box, 
  HStack, 
  Heading, 
  Button, 
  VStack,
  Drawer,
  IconButton,
  Text,
  Link,
  Avatar
} from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, memo, useCallback, useEffect } from "react";
import { UserAvatar } from "./user-avatar";

export const Header = memo(function Header() {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; href: string }>>([]);

  // Generate breadcrumbs based on current path
  useEffect(() => {
    const generateBreadcrumbs = async () => {
      const crumbs: Array<{ label: string; href: string }> = [];
      
      if (pathname === '/dashboard') {
        crumbs.push({ label: "Børn", href: "/dashboard" });
      } else if (pathname?.startsWith('/users/')) {
        // User profile page (e.g., /users/esben-stephansen)
        const username = pathname.split('/')[2]; // Get username from path
        crumbs.push({ label: user?.displayName || "Bruger", href: pathname });
      } else if (pathname === '/settings') {
        // Settings page (accessed from "Rediger profil")
        crumbs.push({ label: user?.displayName || "Bruger", href: `/users/${user?.primaryEmail?.split('@')[0] || 'profile'}` });
        crumbs.push({ label: "Indstillinger", href: "/settings" });
      } else if (pathname?.match(/^\/[^\/]+$/)) {
        // Child profile page (e.g., /mads, /hilda)
        const slug = pathname.slice(1); // Remove leading slash
        
        // Fetch child name from slug
        try {
          const response = await fetch(`/api/children/slug/${slug}`);
          if (response.ok) {
            const childData = await response.json();
            crumbs.push({ label: "Børn", href: "/dashboard" });
            crumbs.push({ label: childData.child.name, href: pathname });
          } else {
            crumbs.push({ label: "Børn", href: "/dashboard" });
          }
        } catch (error) {
          console.error('Error fetching child data for breadcrumb:', error);
          crumbs.push({ label: "Børn", href: "/dashboard" });
        }
      } else {
        // Default fallback
        crumbs.push({ label: "Børn", href: "/dashboard" });
      }
      
      setBreadcrumbs(crumbs);
    };

    if (pathname) {
      generateBreadcrumbs();
    }
  }, [pathname]);

  const handleMenuItemClick = useCallback((href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  }, [router]);

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
      <HStack 
        justify={{ base: "center", md: "space-between" }} 
        maxW="7xl" 
        mx="auto" 
        position="relative"
      >
        {/* Logo */}
        <Heading 
          size={{ base: "xl", md: "lg" }}
          fontWeight="700" 
          letterSpacing="-0.02em"
          style={{
            background: 'linear-gradient(135deg, #e07a5f 0%, #3d405b 25%, #81b29a 75%, #f2cc8f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          order={{ base: 0, md: 0 }}
        >
          ReSchool<Text 
            as="sup" 
            fontSize="2xs" 
            ml={0.5}
            fontWeight="300"
            style={{
              color: '#81b29a',
              WebkitTextFillColor: '#81b29a'
            }}
          >©</Text>
        </Heading>
        
        {/* Desktop Navigation - Breadcrumb Style */}
        <HStack gap={2} display={{ base: "none", md: "flex" }}>
          {user && breadcrumbs.map((crumb, index) => (
            <HStack key={`${crumb.href}-${index}`} gap={2}>
              <Box 
                position="relative"
                cursor="pointer"
                onClick={() => router.push(crumb.href)}
                onMouseEnter={() => setHoveredItem(crumb.href)}
                onMouseLeave={() => setHoveredItem(null)}
                py={2}
                px={1}
              >
                <Text
                  fontSize="md"
                  fontWeight="600"
                  color={hoveredItem === crumb.href ? "#3d405b" : "#3d405b"}
                  transform={hoveredItem === crumb.href ? "translateY(-1px)" : "translateY(0)"}
                  transition="all 0.3s ease"
                >
                  {crumb.label}
                </Text>
                
                {/* Animated underline - matching page colors for symbolic value */}
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  width={
                    (hoveredItem === crumb.href) || 
                    (index === breadcrumbs.length - 1) // Active page (last breadcrumb)
                      ? "60%" : "0%"
                  }
                  height="4px"
                  backgroundColor={
                    crumb.label === "Børn" ? "#81b29a" : 
                    crumb.label === "Indstillinger" ? "#e07a5f" : // Orange for settings
                    (pathname?.startsWith('/users/') || (pathname === "/settings" && crumb.href.startsWith('/users/'))) ? "#3d405b" : // Dark blue for user name
                    "#f2cc8f" // Default yellow for child names
                  }
                  borderRadius="9999px"
                  transition="all 0.3s ease"
                  zIndex={10}
                />
              </Box>
              
              {/* Arrow separator */}
              {index < breadcrumbs.length - 1 && (
                <Text 
                  color="#6b7280" 
                  fontSize="sm"
                  fontWeight="500"
                  mx={1}
                >
                  →
                </Text>
              )}
            </HStack>
          ))}
        </HStack>

        {/* Right side items */}
        <HStack gap={3} display={{ base: "none", md: "flex" }}>
          {/* User Avatar - hidden on mobile since it's in the hamburger menu */}
          <Box position="relative">
            {user && <UserAvatar />}
          </Box>
        </HStack>

        {/* Mobile menu button - positioned absolutely */}
        {user && (
          <IconButton
            aria-label="Åbn menu"
            onClick={() => setIsMenuOpen(true)}
            variant="ghost"
            display={{ base: "flex", md: "none" }}
            className="text-delft-blue-500 hover:bg-cambridge-blue-900"
            size="sm"
            position="absolute"
            right={0}
            top="50%"
            transform="translateY(-50%)"
          >
            <HamburgerIcon />
          </IconButton>
        )}
      </HStack>

      {/* Mobile Drawer Menu */}
      <Drawer.Root 
        open={isMenuOpen} 
        onOpenChange={(details: { open: boolean }) => setIsMenuOpen(details.open)}
        placement="end"
        size="full"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="white" borderLeftWidth={1} borderColor="gray.200">
            <Drawer.Header borderBottomWidth={1} borderColor="border.muted" p={4} bg="gray.50">
              <HStack justify="space-between" align="center">
                <Drawer.Title>
                  <Text fontSize="lg" color="navy.800" fontWeight="600">
                    Menu
                  </Text>
                </Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <IconButton
                    aria-label="Luk menu"
                    variant="ghost"
                    size="sm"
                    colorPalette="gray"
                  >
                    <CloseIcon />
                  </IconButton>
                </Drawer.CloseTrigger>
              </HStack>
            </Drawer.Header>
            
            <Drawer.Body p={0}>
              <VStack gap={0} align="stretch" h="full">
              {/* User info section at top - clickable to go to profile */}
              {user && (
                <Button
                  onClick={() => handleMenuItemClick(`/users/${user.primaryEmail?.split('@')[0] || 'profile'}`)}
                  variant="ghost"
                  p={6}
                  borderBottomWidth={1}
                  borderColor="border.muted"
                  bg="gray.25"
                  borderRadius={0}
                  h="auto"
                  _hover={{ bg: "gray.50" }}
                  _active={{ bg: "gray.100" }}
                >
                  <HStack gap={4} align="center" w="full">
                    <Avatar.Root size="lg">
                      <Avatar.Image 
                        src={user.profileImageUrl || undefined}
                        alt={user.displayName || 'User'}
                      />
                      <Avatar.Fallback>
                        {user.displayName 
                          ? user.displayName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
                          : user.primaryEmail?.charAt(0).toUpperCase() || 'U'
                        }
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <VStack gap={1} align="start" flex={1}>
                      <Text fontSize="lg" fontWeight="semibold" color="navy.800">
                        {user.displayName || "Ingen navn"}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {user.primaryEmail}
                      </Text>
                    </VStack>
                  </HStack>
                </Button>
              )}
              
              {/* Navigation section */}
              <Box p={4}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3} px={2}>
                  Forløb
                </Text>
                <VStack gap={1} align="stretch">
                  <Button
                    onClick={() => handleMenuItemClick("/dashboard")}
                    variant="ghost"
                    justifyContent="flex-start"
                    h="auto"
                    p={4}
                    borderRadius="lg"
                    fontWeight="500"
                    fontSize="md"
                    color="fg.default"
                    _hover={{ 
                      bg: "gray.50"
                    }}
                    _active={{ bg: "gray.100" }}
                  >
                    Børn
                  </Button>
                </VStack>
              </Box>
              
              {/* Account menu items */}
              <Box p={4} borderTopWidth={1} borderColor="border.muted">
                <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3} px={2}>
                  Konto
                </Text>
                <VStack gap={1} align="stretch">
                  <Button
                    onClick={() => handleMenuItemClick("/settings")}
                    variant="ghost"
                    justifyContent="flex-start"
                    h="auto"
                    p={4}
                    borderRadius="lg"
                    fontWeight="500"
                    fontSize="md"
                    color="fg.default"
                    _hover={{ 
                      bg: "gray.50"
                    }}
                    _active={{ bg: "gray.100" }}
                  >
                    Indstillinger
                  </Button>
                </VStack>
              </Box>                {/* Logout button at bottom */}
                <Box p={4} mt="auto">
                  <Button
                    onClick={() => {
                      user?.signOut();
                      setIsMenuOpen(false);
                    }}
                    variant="ghost"
                    justifyContent="flex-start"
                    w="full"
                    h="auto"
                    p={4}
                    borderRadius="lg"
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
                </Box>
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </Box>
  );
});
