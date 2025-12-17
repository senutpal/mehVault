/**
 * @fileoverview Root layout component.
 * Sets up providers, fonts, and global styles.
 *
 * @module app/layout
 */

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider, WalletProvider } from "@/providers";
import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

// ============================================================================
// Fonts
// ============================================================================

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-geist-mono",
  display: "swap",
});

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "mehVault - Secure Web3 Wallet",
  description:
    "A secure, minimal Web3 wallet supporting Solana and Ethereum. Generate and manage HD wallets.",
  keywords: ["web3", "wallet", "solana", "ethereum", "crypto", "hd wallet"],
};

// ============================================================================
// Layout Component
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout wrapping all pages with providers and global styles.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.className} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            {children}
            <Toaster position="bottom-right" />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
