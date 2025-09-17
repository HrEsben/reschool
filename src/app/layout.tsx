import type { Metadata, Viewport } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";
import RisingFooter from "@/components/ui/rising-footer";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
});

export const metadata: Metadata = {
  title: "ReSchool - En tryg vej tilbage i skole",
  description: "En tryg vej tilbage i skole for børn med ufrivilligt skolefravær",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReSchool",
    startupImage: [
      {
        url: "/apple-touch-icon.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "ReSchool",
    "application-name": "ReSchool",
    "msapplication-TileColor": "#81b29a",
    "msapplication-config": "none",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#81b29a" },
    { media: "(prefers-color-scheme: dark)", color: "#81b29a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//api.stackframe.co" />
        <link rel="dns-prefetch" href="//api.stack-auth.com" />
        <link rel="dns-prefetch" href="//app.stack-auth.com" />
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="//api.stackframe.co" />
        <link rel="preconnect" href="//api.stack-auth.com" />
        
        {/* Prefetch critical routes */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/login" />
        
        {/* Resource hints for better performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        
        {/* Optimize for bfcache */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#81b29a" />
        
        {/* PWA iOS specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ReSchool" />
        
        {/* Additional PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="ReSchool" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <StackProvider app={stackServerApp}>
            <StackTheme>
              <div style={{ 
                position: 'relative', 
                zIndex: 10, 
                borderBottom: '1px solid #e5e5e5',
                backgroundColor: '#fdfcf8', // Eggshell background for content
                minHeight: '100vh'
              }}>
                {children}
                <PWAInstallPrompt />
              </div>
              <RisingFooter />
            </StackTheme>
          </StackProvider>
        </Provider>
      </body>
    </html>
  );
}
