"use client";

import { ReactNode } from 'react';
import { Text } from '@chakra-ui/react';
import { DialogManager, WarningDialog, InfoDialog, SuccessDialog } from './dialog-manager';

// Example: Simple confirmation dialog
interface ConfirmationDialogProps {
  trigger: ReactNode;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  type?: 'warning' | 'info' | 'error';
}

export function ConfirmationDialog({
  trigger,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  type = 'warning'
}: ConfirmationDialogProps) {
  const DialogComponent = type === 'warning' ? WarningDialog : type === 'info' ? InfoDialog : DialogManager;
  
  return (
    <DialogComponent
      trigger={trigger}
      title={title}
      icon={type === 'warning' ? '⚠️' : type === 'info' ? 'ℹ️' : '❓'}
      primaryAction={{
        label: "Bekræft",
        onClick: onConfirm,
        colorScheme: type === 'warning' ? 'orange' : 'blue',
        isLoading: isLoading,
        loadingText: "Behandler..."
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: onCancel || (() => {}),
        variant: "outline",
        colorScheme: "gray"
      }}
    >
      <Text color="gray.700" fontSize="md">
        {message}
      </Text>
    </DialogComponent>
  );
}

// Example: Success notification dialog
interface SuccessNotificationProps {
  trigger: ReactNode;
  title: string;
  message: string;
  onClose?: () => void;
}

export function SuccessNotification({
  trigger,
  title,
  message,
  onClose
}: SuccessNotificationProps) {
  return (
    <SuccessDialog
      trigger={trigger}
      title={title}
      icon="✅"
      primaryAction={{
        label: "OK",
        onClick: onClose || (() => {}),
        colorScheme: "green"
      }}
    >
      <Text color="gray.700" fontSize="md">
        {message}
      </Text>
    </SuccessDialog>
  );
}

// Example: Info dialog
interface InfoNotificationProps {
  trigger: ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function InfoNotification({
  trigger,
  title,
  message,
  actionLabel = "OK",
  onAction
}: InfoNotificationProps) {
  return (
    <InfoDialog
      trigger={trigger}
      title={title}
      icon="ℹ️"
      primaryAction={{
        label: actionLabel,
        onClick: onAction || (() => {}),
        colorScheme: "blue"
      }}
    >
      <Text color="gray.700" fontSize="md">
        {message}
      </Text>
    </InfoDialog>
  );
}
