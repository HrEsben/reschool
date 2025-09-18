import NotificationTest from '@/components/notification-test';

export default function TestNotifications() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Push Notification Test
        </h1>
        
        <div className="max-w-md mx-auto">
          <NotificationTest />
        </div>
        
        <div className="mt-8 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📱 iOS PWA Badge Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">For iOS Safari PWA:</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                <li>Add this site to your home screen (Share → Add to Home Screen)</li>
                <li>Open the PWA from your home screen</li>
                <li>Enable notifications using the button above</li>
                <li>When a child submits a form, the app icon will show a badge 🔴</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium">For Desktop/Android:</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                <li>Enable notifications using the button above</li>
                <li>You'll receive standard push notifications</li>
                <li>Notifications work even when the tab is closed</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
