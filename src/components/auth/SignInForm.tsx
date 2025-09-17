import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const SignInForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  setLoading,
}: SignInFormProps) => {
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const [showPassword, setShowPassword] = useState(false);

  // Reset dialog state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // --- GOOGLE OAUTH (manual redirect for reliability) ---
  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "consent", access_type: "offline" },
          skipBrowserRedirect: true, // we will redirect ourselves
        },
      });

      if (error) {
        throw error;
      }
      if (!data?.url) {
        throw new Error("No redirect URL returned from Supabase.");
      }

      // Navigate away (this page will unload)
      window.location.assign(data.url);
      // Do not setLoading(false) here—navigation is in progress.
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      toast({
        title: "Google sign in failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const msg = error.message || "Sign in failed.";
        if (/Invalid login credentials/i.test(msg)) {
          toast({
            title: "Check your credentials",
            description:
              "We couldn’t find an account with that email/password. Try again, sign up, or use Google.",
            variant: "destructive",
          });
        } else if (/Email not confirmed/i.test(msg)) {
          toast({
            title: "Email not confirmed",
            description:
              "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Sign in failed", description: msg, variant: "destructive" });
        }
        return;
      }

      if (data?.user && data?.session) {
        toast({
          title: "Welcome back!",
          description: "You’ve signed in to CountedCare.",
        });
        // Navigation handled by your global auth listener
      }
    } catch (err) {
      console.error("Unexpected sign in error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetLoading) return;

    const trimmed = resetEmail.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      toast({
        title: "Valid email required",
        description: "Please enter the email associated with your account.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        const msg = error.message || "Reset failed.";
        if (/Email not found/i.test(msg)) {
          toast({
            title: "Email not found",
            description:
              "We couldn’t find an account with that email. Check the address or sign up.",
            variant: "destructive",
          });
        } else if (/rate limit/i.test(msg)) {
          toast({
            title: "Too many requests",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Reset failed", description: msg, variant: "destructive" });
        }
        return;
      }

      toast({
        title: "Password reset sent",
        description:
          "Check your inbox for a secure link to reset your password (expires in 1 hour).",
      });
      setResetDialogOpen(false);
      setResetEmail("");
    } catch (err) {
      console.error("Unexpected reset error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <div className="relative">
              <Input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 px-3 grid place-items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((s) => !s)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          <div className="text-center space-y-2">
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm text-primary" disabled={loading}>
                  Forgot your password?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset your password</DialogTitle>
                  <DialogDescription>
                    Enter your email address and we’ll send you a secure link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={resetLoading}
                      inputMode="email"
                      autoComplete="email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setResetDialogOpen(false)}
                      disabled={resetLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={resetLoading}>
                      {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send reset link
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
};

export default SignInForm;

