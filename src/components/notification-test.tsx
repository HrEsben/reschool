'use client';

import React, { useState } from 'react';
import { useFirebaseNotifications, useNovuIntegration } from '@/hooks/useFirebaseNotifications';

export default function NotificationTest() {
  const [testStatus, setTestStatus] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { 
    permission, 
    token: fcmToken, 
    error, 
    requestPermission, 
    isLoading
  } = useFirebaseNotifications();
  
  const { isRegistered } = useNovuIntegration();

  const handleTestNotifications = async () => {
    try {
      setTestStatus('Requesting permission...');
      setIsRegistering(true);
      
      // First request permission
      const granted = await requestPermission();
      if (!granted) {
        setTestStatus('❌ Permission denied');
        setIsRegistering(false);
        return;
      }
      
      setTestStatus('✅ Permission granted! Registering with Novu...');
      
      // Register with Novu via API
      if (fcmToken) {
        const response = await fetch('/api/notifications/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fcmToken,
            platform: 'web'
          }),
        });

        if (response.ok) {
          setTestStatus('🎉 Successfully registered for push notifications!');
        } else {
          const errorData = await response.json();
          setTestStatus(`❌ Failed to register with Novu: ${errorData.error || 'Unknown error'}`);
        }
      } else {
        setTestStatus('❌ No FCM token available');
      }
    } catch (err) {
      console.error('Test failed:', err);
      setTestStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const testPushNotification = async () => {
    try {
      setTestStatus('Sending test notification...');
      
      const response = await fetch('/api/test-notification-simple', {
        method: 'POST'
      });
      
      if (response.ok) {
        setTestStatus('✅ Test notification sent! Check your notifications.');
      } else {
        const errorData = await response.json();
        setTestStatus(`❌ Failed to send notification: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Test notification failed:', err);
      setTestStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🔔 Push Notification Test</h2>
      
      <div className="space-y-4">
        <div className="text-sm space-y-2">
          <div>
            <strong>Permission:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              permission === 'granted' ? 'bg-green-100 text-green-800' :
              permission === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {permission || 'not-requested'}
            </span>
          </div>
          
          {fcmToken && (
            <div>
              <strong>FCM Token:</strong> 
              <span className="ml-2 text-xs text-gray-500">
                {fcmToken.substring(0, 20)}...
              </span>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-xs">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleTestNotifications}
            disabled={isRegistering || isLoading || permission === 'granted'}
            className={`w-full py-2 px-4 rounded font-medium ${
              permission === 'granted' 
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
            }`}
          >
            {isRegistering ? '⏳ Registering...' : 
             isLoading ? '⏳ Loading...' :
             permission === 'granted' ? '✅ Notifications Enabled' : '🔔 Enable Notifications'}
          </button>

          {permission === 'granted' && fcmToken && (
            <button
              onClick={testPushNotification}
              className="w-full py-2 px-4 bg-green-500 text-white rounded font-medium hover:bg-green-600"
            >
              📤 Send Test Notification
            </button>
          )}
        </div>

        {testStatus && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            {testStatus}
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p><strong>Note:</strong> For iOS Safari PWA, notifications will show as app badges. 
           On other browsers, you'll see standard push notifications.</p>
      </div>
    </div>
  );
}
