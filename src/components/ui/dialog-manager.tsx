"use client";

import React, { ReactNode } from 'react';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
  Button,
  Text,
  VStack,
  HStack,
  Box
} from '@chakra-ui/react';

export type DialogType = 'default' | 'warning' | 'error' | 'success' | 'info';

export interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  colorScheme?: string;
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
}

export interface DialogManagerProps {
  /** The trigger element that opens the dialog */
  trigger: ReactNode;
  
  /** Dialog title */
  title: string;
  
  /** Dialog content/body */
  children: ReactNode;
  
  /** Type of dialog affecting color scheme and styling */
  type?: DialogType;
  
  /** Primary action (usually on the right) */
  primaryAction?: DialogAction;
  
  /** Secondary action (usually cancel/close) */
  secondaryAction?: DialogAction;
  
  /** Additional custom actions */
  customActions?: DialogAction[];
  
  /** Maximum width of the dialog */
  maxWidth?: string;
  
  /** Whether to show the close X button */
  showCloseButton?: boolean;
  
  /** Custom icon for the dialog header */
  icon?: string;
  
  /** Whether dialog is controlled externally */
  isOpen?: boolean;
  
  /** Callback when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
}

const getDialogStyles = (type: DialogType) => {
  switch (type) {
    case 'warning':
      return {
        headerBg: 'orange.50',
        borderColor: 'orange.200',
        titleColor: 'orange.700',
        iconColor: 'orange.500'
      };
    case 'error':
      return {
        headerBg: 'red.50',
        borderColor: 'red.200',
        titleColor: 'red.700',
        iconColor: 'red.500'
      };
    case 'success':
      return {
        headerBg: 'green.50',
        borderColor: 'green.200',
        titleColor: 'green.700',
        iconColor: 'green.500'
      };
    case 'info':
      return {
        headerBg: 'blue.50',
        borderColor: 'blue.200',
        titleColor: 'blue.700',
        iconColor: 'blue.500'
      };
    default:
      return {
        headerBg: 'gray.50',
        borderColor: 'gray.200',
        titleColor: 'gray.700',
        iconColor: 'gray.500'
      };
  }
};

export function DialogManager({
  trigger,
  title,
  children,
  type = 'default',
  primaryAction,
  secondaryAction,
  customActions = [],
  maxWidth = 'md',
  showCloseButton = true,
  icon,
  isOpen,
  onOpenChange
}: DialogManagerProps) {
  const styles = getDialogStyles(type);
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const allActions = [
    ...(secondaryAction ? [secondaryAction] : []),
    ...customActions,
    ...(primaryAction ? [primaryAction] : [])
  ];

  return (
    <DialogRoot open={open} onOpenChange={({ open }) => setOpen(open)}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogBackdrop />
      
      <DialogContent 
        maxW={maxWidth}
        w="90vw"
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex="modal"
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        border="2px solid"
        borderColor={styles.borderColor}
        p={0}
        maxH="90vh"
        overflow="hidden"
      >
        {/* Header */}
        <DialogHeader 
          bg={styles.headerBg}
          borderBottom="1px solid" 
          borderColor={styles.borderColor}
          p={6}
          position="relative"
        >
          <HStack gap={3} align="center">
            {icon && (
              <Text fontSize="xl" color={styles.iconColor}>
                {icon}
              </Text>
            )}
            <DialogTitle 
              color={styles.titleColor}
              fontSize="xl" 
              fontWeight="bold"
              flex={1}
            >
              {title}
            </DialogTitle>
          </HStack>
          
          {showCloseButton && (
            <DialogCloseTrigger
              position="absolute"
              top={4}
              right={4}
            />
          )}
        </DialogHeader>
        
        {/* Body */}
        <DialogBody p={6} overflow="auto">
          {children}
        </DialogBody>
        
        {/* Footer */}
        {allActions.length > 0 && (
          <DialogFooter 
            bg="gray.50" 
            borderTop="1px solid" 
            borderColor="gray.200"
            p={6}
          >
            <HStack gap={3} width="full" justify="flex-end">
              {allActions.map((action, index) => (
                <Button 
                  key={index}
                  variant={action.variant || 'solid'}
                  colorScheme={action.colorScheme}
                  onClick={() => {
                    action.onClick();
                    if (!action.isLoading) {
                      setOpen(false);
                    }
                  }}
                  loading={action.isLoading}
                  loadingText={action.loadingText}
                  disabled={action.isDisabled}
                >
                  {action.label}
                </Button>
              ))}
            </HStack>
          </DialogFooter>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

// Convenience components for common dialog types
export function WarningDialog(props: Omit<DialogManagerProps, 'type'>) {
  return <DialogManager {...props} type="warning" />;
}

export function ErrorDialog(props: Omit<DialogManagerProps, 'type'>) {
  return <DialogManager {...props} type="error" />;
}

export function SuccessDialog(props: Omit<DialogManagerProps, 'type'>) {
  return <DialogManager {...props} type="success" />;
}

export function InfoDialog(props: Omit<DialogManagerProps, 'type'>) {
  return <DialogManager {...props} type="info" />;
}
