'use client';

import { Inbox } from '@novu/nextjs';
import { useUser } from '@stackframe/stack';

export default function NotificationInbox() {
  const user = useUser();
  const applicationIdentifier = process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER;

  if (!applicationIdentifier) {
    console.error('NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER is not set');
    return null;
  }

  const subscriberId = user?.id || "68cbb9ae95046b25527aa677";

  return (
    <Inbox
      applicationIdentifier={applicationIdentifier}
      subscriberId={subscriberId}
      backendUrl="https://eu.api.novu.co"
      socketUrl="wss://eu.ws.novu.co"
      appearance={{
        variables: {
          colorPrimary: '#3d405b',
          colorPrimaryForeground: '#ffffff',
          colorSecondary: '#81b29a',
          colorSecondaryForeground: '#ffffff',
          colorCounter: '#e07a5f',
          colorCounterForeground: '#ffffff',
          colorBackground: '#fdfcf8',
          colorForeground: '#3d405b',
          colorNeutral: '#d4d6e2',
          colorShadow: '#252737',
          borderRadius: '12px',
          fontSize: '14px',
        },
        elements: {
          bellIcon: {
            color: '#3d405b',
          },
          popoverContent: {
            backgroundColor: '#fdfcf8',
            borderColor: '#e6efeb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(37, 39, 55, 0.1), 0 2px 4px -1px rgba(37, 39, 55, 0.06)',
          },
        },
      }}
      placement="bottom-end"
      placementOffset={{ mainAxis: 8, crossAxis: 8 }}
    />
  );
}
