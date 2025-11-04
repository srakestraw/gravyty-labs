import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gravyty Labs",
  description: "Integrated platform for admissions management, student information systems, and AI-powered automation",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: '/assets/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logos/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicons/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/assets/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/assets/favicons/safari-pinned-tab.svg', rel: 'mask-icon', color: '#0052CC' }
    ]
  },
  manifest: '/assets/favicons/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Font Awesome Kit */}
        <Script 
          src="https://kit.fontawesome.com/a983b74f3b.js" 
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
