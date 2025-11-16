"use client";
import { Home, LayoutDashboard, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";

export function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isDashboard = pathname === "/dashboard";
  const navLabel = isDashboard ? "Home" : "Dashboard";
  const NavIcon = isDashboard ? Home : LayoutDashboard;
  const navTarget = isDashboard ? "/" : "/dashboard";
  const iconColor = theme === "dark" ? "text-yellow-400" : "text-blue-600";

  return (
    <header className="fixed z-50 top-0 w-full backdrop-blur-md bg-background/80 border-b border-accent shadow-md transition-colors duration-500">
      <div className="container mx-auto px-6 py-4 md:py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground select-none">
          mehVault.
        </h1>
        {mounted && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1 ">
              <Button
                variant="link"
                className={iconColor}
                onClick={() => router.push(navTarget)}
              >
                <NavIcon className="h-5 w-5 md:hidden" />
                <p className="hidden md:flex text-lg">{navLabel}</p>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={clsx(
                "rounded-full transition-transform  duration-300 hover:scale-110",
                iconColor
              )}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 animate-[spin_1s_linear]" />
              ) : (
                <Moon className="h-5 w-5 animate-[spin_1s_linear]" />
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
