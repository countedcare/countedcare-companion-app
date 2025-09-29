import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthHeader from "@/components/auth/AuthHeader";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import PasswordResetForm from "@/components/auth/PasswordResetForm";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Read URL params once (avoid effect re-runs).
  const urlInfo = useMemo(
    () => ({
      type: searchParams.get("type"),
      hasAccessToken: Boolean(searchParams.get("access_token")),
      error: searchParams.get("error"),
      errorDescription: searchParams.get("error_description"),
      mode: (searchParams.get("mode") as "signin" | "signup" | null) ?? null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // lock to first mount
  );

  // Initial checks (session + URL handling)
  useEffect(() => {
    const init = async () => {
      try {
        // 1) If already signed in, go to dashboard (unless mid-recovery)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Choose initial tab from URL (mode=signin|signup) or keep default
        if (urlInfo.mode) setTab(urlInfo.mode);

        // 2) Handle password recovery deep link
        if (urlInfo.type === "recovery") {
          setIsPasswordRecovery(true);
          toast({
            title: "Password reset",
            description: "Enter your new password below.",
          });
          return; // stay on this page for reset
        }

        // 3) Handle auth errors in URL
        if (urlInfo.error) {
          toast({
            title: "Authentication error",
            description: urlInfo.errorDescription || urlInfo.error,
            variant: "destructive",
          });
        }

        // 4) If session exists and we’re not in a recovery flow, route to app
        if (session && !urlInfo.hasAccessToken && !urlInfo.type) {
          navigate("/home");
        }
      } catch (e) {
        // Silent error handling - auth initialization errors are non-critical
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to Supabase auth state changes (signin / recovery / etc)
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && !isPasswordRecovery) {
        navigate("/home");
      }
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
        toast({
          title: "Password reset ready",
          description: "You can now enter a new password below.",
        });
      }
    });

    return () => {
      try {
        data.subscription.unsubscribe();
      } catch {
        /* no-op */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPasswordRecovery]);

  // Recovery view
  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-50">
        <AuthHeader />
        <Card className="w-full max-w-md">
          <PasswordResetForm
            onSuccess={() => {
              setIsPasswordRecovery(false);
              toast({
                title: "Password updated",
                description: "Your password was changed. You’re now signed in.",
              });
              // Navigation will be handled by SIGNED_IN event
            }}
          />
        </Card>
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>© 2025 CountedCare. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="https://countedcare.com/privacy-policy" className="hover:text-primary underline">Privacy Policy</a>
          <a href="https://countedcare.com/terms-and-conditions" className="hover:text-primary underline">Terms & Conditions</a>
        </div>
      </div>
      </div>
    );
  }

  // Default Auth (Sign in / Sign up)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-50">
      <AuthHeader />
      <Card className="w-full max-w-md">
        <Tabs value={tab} onValueChange={(value) => setTab(value as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              setLoading={setLoading}
            />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              setLoading={setLoading}
            />
          </TabsContent>
        </Tabs>
      </Card>
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>© 2025 CountedCare. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="https://countedcare.com/privacy-policy" className="hover:text-primary underline">Privacy Policy</a>
          <a href="https://countedcare.com/terms-and-conditions" className="hover:text-primary underline">Terms & Conditions</a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
