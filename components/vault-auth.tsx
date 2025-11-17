"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Unlock, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VaultAuthProps {
  isNewUser: boolean;
  onUnlock: (password: string) => Promise<void>;
  onReset: () => void;
  isAlreadyUnlocked?: boolean;
}

export function VaultAuth({
  isNewUser,
  onUnlock,
  onReset,
  isAlreadyUnlocked = false,
}: VaultAuthProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) return;

    if (isNewUser) {
      if (password.length < 8) {
        toast.error("Password too weak", {
          description: "Password must be at least 8 characters",
        });
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    try {
      await onUnlock(password);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 md:p-8 max-w-md w-full mx-auto space-y-6 border-accent-foreground/20">
      <CardHeader className="p-0 text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {isNewUser ? (
            <Lock className="w-6 h-6" />
          ) : (
            <Unlock className="w-6 h-6" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {isNewUser
            ? "Create Vault Password"
            : isAlreadyUnlocked
            ? "Vault Already Unlocked"
            : "Unlock Your Vault"}
        </CardTitle>
        <CardDescription className="text-sm px-2">
          {isNewUser
            ? "This password encrypts your wallet locally. It cannot be recovered if lost."
            : isAlreadyUnlocked
            ? "Your vault is already unlocked. Continue to generate wallets."
            : "Enter your password to access your secure wallet."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {!isAlreadyUnlocked && (
          <>
            <Input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {isNewUser && (
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            )}

            <Button
              onClick={handleSubmit}
              className="w-full h-11"
              disabled={loading || !password}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? "Processing..."
                : isNewUser
                ? "Create Vault"
                : "Unlock"}
            </Button>
          </>
        )}

        {!isNewUser && (
          <div className="pt-4 border-t text-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure? This will WIPE all your wallet data permanently."
                  )
                ) {
                  onReset();
                }
              }}
            >
              <AlertTriangle className="mr-2 h-3 w-3" />
              Reset Vault (Wipe Data)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
