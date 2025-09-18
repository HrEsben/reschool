'use client';

import { Button, VStack, Text } from '@chakra-ui/react';
import { useUser } from '@stackframe/stack';
import { useState } from 'react';

export default function NovuTester() {
  const [testing, setTesting] = useState(false);
  const [testingEU, setTestingEU] = useState(false);
  const [message, setMessage] = useState('');
  const [euMessage, setEuMessage] = useState('');
  const user = useUser();

  const testNovuConnection = async () => {
    if (!user?.id) {
      setMessage('❌ No user logged in');
      return;
    }

    setTesting(true);
    setMessage('');
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriberId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ ' + data.message);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Failed to connect to backend');
    } finally {
      setTesting(false);
    }
  };

  const testNovuEU = async () => {
    if (!user?.id) {
      setEuMessage('❌ No user logged in');
      return;
    }

    setTestingEU(true);
    setEuMessage('');
    try {
      const response = await fetch('/api/test-novu-eu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriberId: user.id,
          testMessage: 'Test from ReSchool Denmark'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEuMessage(`✅ ${data.message}\n\n` + 
          Object.entries(data.tests || {})
            .map(([key, value]) => `${value}`)
            .join('\n'));
      } else {
        setEuMessage('❌ ' + data.error);
      }
    } catch (error) {
      setEuMessage('❌ Failed to connect to Novu EU');
    } finally {
      setTestingEU(false);
    }
  };

  return (
    <VStack gap={4} p={4} bg="sage.50" borderRadius="md">
      <Text fontWeight="bold" color="navy.600">
        🔔 Novu Integration Test
      </Text>
      <Text fontSize="sm" color="navy.500" textAlign="center">
        Test the notification system with both current setup and new EU region integration.
      </Text>
      
      {/* Original Test */}
      <VStack gap={2} w="full">
        <Button
          colorScheme="sage"
          onClick={testNovuConnection}
          loading={testing}
          size="sm"
          w="full"
        >
          {testing ? 'Testing...' : 'Test Current Backend'}
        </Button>
        {message && (
          <Text fontSize="sm" color={message.includes('✅') ? 'green.600' : 'red.600'} whiteSpace="pre-line">
            {message}
          </Text>
        )}
      </VStack>

      {/* EU Test */}
      <VStack gap={2} w="full">
        <Button
          colorScheme="blue"
          onClick={testNovuEU}
          loading={testingEU}
          size="sm"
          w="full"
        >
          {testingEU ? 'Testing EU...' : '🇪🇺 Test Novu EU (GDPR)'}
        </Button>
        {euMessage && (
          <Text fontSize="sm" color={euMessage.includes('✅') ? 'green.600' : 'red.600'} whiteSpace="pre-line">
            {euMessage}
          </Text>
        )}
      </VStack>

      {user?.id && (
        <Text fontSize="xs" color="gray.600">
          User ID: {user.id}
        </Text>
      )}
    </VStack>
  );
}
