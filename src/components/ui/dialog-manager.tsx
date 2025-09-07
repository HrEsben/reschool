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
  onClick: () => void | Promise<void>;
  variant?: 'solid' | 'outline' | 'ghost';
  colorScheme?: string;
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
  preventAutoClose?: boolean; // New prop to prevent auto-closing
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
        headerBg: 'golden.50',
        borderColor: 'golden.200',
        titleColor: 'golden.700',
        iconColor: 'golden.500'
      };
    case 'error':
      return {
        headerBg: 'coral.50',
        borderColor: 'coral.200',
        titleColor: 'coral.700',
        iconColor: 'coral.500'
      };
    case 'success':
      return {
        headerBg: 'sage.50',
        borderColor: 'sage.200',
        titleColor: 'sage.700',
        iconColor: 'sage.500'
      };
    case 'info':
      return {
        headerBg: 'navy.50',
        borderColor: 'navy.200',
        titleColor: 'navy.700',
        iconColor: 'navy.500'
      };
    default:
      return {
        headerBg: 'cream.50',
        borderColor: 'cream.200',
        titleColor: 'navy.700',
        iconColor: 'navy.500'
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
        border="2px solid"
        borderColor={styles.borderColor}
        p={0}
        maxH="90vh"
        overflow="hidden"
        margin={0}
        marginBlock={0}
        marginInline={0}
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
            bg="cream.25" 
            borderTop="1px solid" 
            borderColor="cream.200"
            p={6}
          >
            <HStack gap={3} width="full" justify="flex-end">
              {allActions.map((action, index) => {
                // Determine button colors based on action type and position
                let buttonProps: any = {
                  variant: action.variant || 'solid'
                };
                
                if (action.colorScheme === 'sage') {
                  buttonProps.bg = 'sage.500';
                  buttonProps.color = 'white';
                  buttonProps._hover = { bg: 'sage.600' };
                } else if (action.colorScheme === 'coral') {
                  buttonProps.bg = 'coral.500';
                  buttonProps.color = 'white';
                  buttonProps._hover = { bg: 'coral.600' };
                } else if (action.colorScheme === 'navy') {
                  buttonProps.bg = 'navy.500';
                  buttonProps.color = 'white';
                  buttonProps._hover = { bg: 'navy.600' };
                } else if (action.colorScheme === 'gray') {
                  buttonProps.variant = 'outline';
                  buttonProps.borderColor = 'gray.300';
                  buttonProps.color = 'gray.700';
                  buttonProps._hover = { bg: 'gray.50' };
                } else {
                  // Default colors for primary/secondary based on position
                  if (index === allActions.length - 1) {
                    // Primary action (last button)
                    buttonProps.bg = 'sage.500';
                    buttonProps.color = 'white';
                    buttonProps._hover = { bg: 'sage.600' };
                  } else {
                    // Secondary action
                    buttonProps.variant = 'outline';
                    buttonProps.borderColor = 'gray.300';
                    buttonProps.color = 'gray.700';
                    buttonProps._hover = { bg: 'gray.50' };
                  }
                }
                
                return (
                  <Button 
                    key={index}
                    {...buttonProps}
                    onClick={async () => {
                      await action.onClick();
                      if (!action.isLoading && !action.preventAutoClose) {
                        setOpen(false);
                      }
                    }}
                    loading={action.isLoading}
                    loadingText={action.loadingText}
                    disabled={action.isDisabled}
                  >
                    {action.label}
                  </Button>
                );
              })}
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
