/**
 * @fileoverview Header component with navigation and theme toggle.
 *
 * @module components/common/header
 */

"use client";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Application header with branding and theme toggle.
 * Fixed position with backdrop blur effect.
 */
export function Header() {
  const { theme, setTheme } = useTheme();
  const isMounted = useMounted();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/80 border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4 md:py-5 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight select-none">
          mehVault<span className="text-primary">.</span>
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {isMounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "rounded-full transition-transform duration-300 hover:scale-110",
                theme === "dark" ? "text-yellow-400" : "text-blue-600"
              )}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

