/**
 * @fileoverview Onboarding layout for the authentication/setup flow.
 * This layout wraps all onboarding steps with consistent styling.
 *
 * @module app/(onboarding)/layout
 */

import { Footer, Header } from "@/components/common";
import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

/**
 * Layout for onboarding flow pages (auth, blockchain selection, seed phrase).
 * Provides consistent header/footer and centered content area.
 */
export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-1 mt-20 md:mt-24 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
