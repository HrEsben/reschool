import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";
import RisingFooter from "@/components/ui/rising-footer";

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
   icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
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
        
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          href="/fonts/geist-sans.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="" 
        />
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="//api.stackframe.co" />
        <link rel="preconnect" href="//api.stack-auth.com" />
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
              </div>
              <RisingFooter />
            </StackTheme>
          </StackProvider>
        </Provider>
      </body>
    </html>
  );
}
