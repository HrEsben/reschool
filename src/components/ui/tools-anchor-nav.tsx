"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Portal,
  useBreakpointValue,
} from '@chakra-ui/react';
import { DragHandleIcon, SettingsIcon } from '@/components/ui/icons';

interface ToolItem {
  id: string;
  name: string;
  title: string; // The actual display title (topic for barometer/smiley, "Sengetider" for sengetider)
  count: number;
  type: 'barometer' | 'dagens-smiley' | 'sengetider';
}

interface ToolsAnchorNavProps {
  tools: ToolItem[];
  onReorder?: (newOrder: ToolItem[]) => void;
  isReorderMode?: boolean;
  onToggleReorderMode?: () => void;
  className?: string;
}

export function ToolsAnchorNav({ 
  tools, 
  onReorder, 
  isReorderMode, 
  onToggleReorderMode,
  className 
}: ToolsAnchorNavProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Responsive positioning
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Set up intersection observer to track active sections
  useEffect(() => {
    const sections = tools.map(tool => document.getElementById(`tool-section-${tool.id}`)).filter(Boolean);
    
    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        
        if (visibleSections.length > 0) {
          const sectionId = visibleSections[0].target.id.replace('tool-section-', '');
          
          // Clear any existing timeout
          if (sectionChangeTimeoutRef.current) {
            clearTimeout(sectionChangeTimeoutRef.current);
          }
          
          // Add a small delay to prevent flickering
          sectionChangeTimeoutRef.current = setTimeout(() => {
            setActiveSection(sectionId);
          }, 150); // 150ms delay
        }
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.7],
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    sections.forEach(section => {
      if (section) observerRef.current?.observe(section);
    });

    return () => {
      if (sectionChangeTimeoutRef.current) {
        clearTimeout(sectionChangeTimeoutRef.current);
      }
      observerRef.current?.disconnect();
    };
  }, [tools]);

  const scrollToSection = (toolId: string) => {
    // Immediately set active section for responsive feedback
    setActiveSection(toolId);
    
    // Clear any pending section change
    if (sectionChangeTimeoutRef.current) {
      clearTimeout(sectionChangeTimeoutRef.current);
    }
    
    const element = document.getElementById(`tool-section-${toolId}`);
    if (element) {
      const yOffset = -100; // Offset for fixed navigation
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    if (!isReorderMode) return;
    setDraggedItem(toolId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, toolId: string) => {
    if (!isReorderMode || !draggedItem) return;
    e.preventDefault();
    setDragOver(toolId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!isReorderMode || !draggedItem || !onReorder) return;
    e.preventDefault();
    
    if (draggedItem === targetId) {
      setDraggedItem(null);
      setDragOver(null);
      return;
    }

    const draggedIndex = tools.findIndex(tool => tool.id === draggedItem);
    const targetIndex = tools.findIndex(tool => tool.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTools = [...tools];
    const [removed] = newTools.splice(draggedIndex, 1);
    newTools.splice(targetIndex, 0, removed);
    
    onReorder(newTools);
    setDraggedItem(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOver(null);
  };

  if (tools.length === 0) return null;

  return (
    <Portal>
      {/* Only show on desktop - hidden on mobile for better UX */}
      {!isMobile && (
        <Box
          position="fixed"
          top="50%"
          left={20}
          transform="translateY(-50%)"
          zIndex={100}
          className={className}
        >
          <VStack 
            p={3}
            gap={2}
            minW="120px"
            maxW="180px"
            transition="all 0.3s ease"
            _hover={{
              "& .settings-icon": {
                opacity: 1,
                transform: "scale(1)",
              }
            }}
          >
            {/* Settings icon for desktop */}
            {onToggleReorderMode && (
              <Box w="100%" display="flex" justifyContent="flex-end" pb={2}>
                <IconButton
                  aria-label={isReorderMode ? "Afslut omarrangering" : "Omarranger værktøjer"}
                  title={isReorderMode ? "Afslut omarrangering" : "Omarranger værktøjer"}
                  size="xs"
                  variant="ghost"
                  color={isReorderMode ? "sage.600" : "gray.400"}
                  onClick={onToggleReorderMode}
                  borderRadius="lg"
                  className="settings-icon"
                  opacity={0}
                  transform="scale(0.8)"
                  _hover={{
                    color: isReorderMode ? "sage.700" : "gray.600",
                  }}
                  transition="all 0.3s ease"
                >
                  <SettingsIcon size={8} />
                </IconButton>
              </Box>
            )}

            {/* Tool navigation items */}
            <VStack gap={1} w="100%">
              {tools.map((tool) => {
                const isActive = activeSection === tool.id;
                const isDragging = draggedItem === tool.id;
                const isDragOver = dragOver === tool.id;
                
                return (
                  <Box
                    key={tool.id}
                    w="100%"
                    draggable={isReorderMode}
                    onDragStart={(e) => handleDragStart(e, tool.id)}
                    onDragOver={(e) => handleDragOver(e, tool.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, tool.id)}
                    onDragEnd={handleDragEnd}
                    opacity={isDragging ? 0.5 : 1}
                    transform={isDragOver && !isDragging ? "scale(1.02)" : "scale(1)"}
                    transition="all 0.2s ease"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      w="100%"
                      justifyContent="flex-end"
                      onClick={() => !isReorderMode && scrollToSection(tool.id)}
                      cursor={isReorderMode ? "grab" : "pointer"}
                      bg="transparent"
                      color={isActive ? "sage.700" : "gray.500"}
                      role="group"
                      _hover={{
                        color: isActive ? "sage.800" : "gray.700",
                      }}
                      _active={{
                        transform: isReorderMode ? "none" : "scale(0.98)"
                      }}
                      px={3}
                      py={2}
                      h="auto"
                      minH="36px"
                      borderRadius="lg"
                      transition="all 0.3s ease"
                    >
                      <HStack gap={2} w="100%" justify="flex-end">
                        <Text 
                          fontSize="sm" 
                          fontWeight={isActive ? "semibold" : "medium"}
                          lineHeight="1.2"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          textAlign="right"
                          maxW="140px"
                          transition="all 0.2s ease"
                          _groupHover={{
                            fontSize: "md",
                            transform: "scale(1.05)"
                          }}
                        >
                          {tool.title}
                        </Text>
                        
                        {isReorderMode && (
                          <DragHandleIcon 
                            size={6} 
                            color="gray.400"
                            cursor="grab"
                            _hover={{ color: "gray.600" }}
                          />
                        )}
                      </HStack>
                    </Button>
                  </Box>
                );
              })}
            </VStack>

            {/* Reorder hint for desktop */}
            {isReorderMode && (
              <Box
                pt={2}
                borderTop="1px solid"
                borderColor="gray.100"
                w="100%"
              >
                <Text 
                  fontSize="xs" 
                  color="gray.500" 
                  textAlign="center"
                  lineHeight="1.3"
                >
                  Træk for at omarrangere
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Portal>
  );
}
