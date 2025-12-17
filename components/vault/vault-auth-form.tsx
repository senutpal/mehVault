/**
 * @fileoverview Vault authentication form for login/registration.
 *
 * @module components/vault/vault-auth-form
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { AlertTriangle, Loader2, Lock, Unlock } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface VaultAuthFormProps {
  /** Whether this is a new user (registration) or returning user (login) */
  isNewUser: boolean;
  /** Callback when authentication is successful */
  onSubmit: (password: string) => Promise<void>;
  /** Callback when user wants to reset/delete vault */
  onReset?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Vault authentication form component.
 * Handles both new vault creation and existing vault unlock.
 *
 * @example
 * ```tsx
 * <VaultAuthForm
 *   isNewUser={!hasVault}
 *   onSubmit={async (password) => {
 *     if (hasVault) await unlock(password);
 *     else await createVault(password, seedPhrase, blockchain);
 *   }}
 *   onReset={() => deleteVault()}
 * />
 * ```
 */
export function VaultAuthForm({ isNewUser, onSubmit, onReset }: VaultAuthFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Password is required");
      return;
    }

    if (isNewUser) {
      // Validation for new users
      if (password.length < MIN_PASSWORD_LENGTH) {
        toast.error("Password too short", {
          description: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        });
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSubmit(password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (!onReset) return;

    const confirmed = window.confirm(
      "Are you sure? This will permanently DELETE all your wallet data. This action cannot be undone."
    );

    if (confirmed) {
      onReset();
    }
  };

  return (
    <Card className="p-4 md:p-8 max-w-md w-full mx-auto border-accent-foreground/20">
      <CardHeader className="p-0 text-center space-y-4">
        {/* Icon */}
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          {isNewUser ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <CardTitle className="text-2xl">
            {isNewUser ? "Create Vault Password" : "Unlock Your Vault"}
          </CardTitle>
          <CardDescription className="text-sm px-2">
            {isNewUser
              ? "This password encrypts your wallet locally. It cannot be recovered if lost."
              : "Enter your password to access your secure wallet."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <Input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
            autoComplete={isNewUser ? "new-password" : "current-password"}
            required
          />

          {/* Confirm Password (new users only) */}
          {isNewUser && (
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11"
              autoComplete="new-password"
              required
            />
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full h-11" disabled={isLoading || !password}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Processing..." : isNewUser ? "Create Vault" : "Unlock"}
          </Button>
        </form>

        {/* Reset Button (existing users only) */}
        {!isNewUser && onReset && (
          <div className="pt-4 mt-4 border-t text-center">
            <Button type="button" variant="destructive" size="sm" onClick={handleReset}>
              <AlertTriangle className="mr-2 h-3 w-3" />
              Reset Vault (Delete All Data)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
