"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import clsx from "clsx";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/80 border-b border-border/20 shadow-md transition-colors duration-500">
      <div className="container mx-auto px-6 py-4 md:py-6 flex items-center justify-between">
        {/* Branding */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground select-none">
          mehVault.
        </h1>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={clsx(
              "rounded-full transition-transform duration-300 hover:scale-110",
              theme === "dark" ? "text-yellow-400" : "text-blue-600"
            )}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 animate-[spin_1s_linear]" />
            ) : (
              <Moon className="h-5 w-5 animate-[spin_1s_linear]" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
