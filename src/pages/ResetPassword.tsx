import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AuthHeader from "@/components/auth/AuthHeader";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isValidReset, setIsValidReset] = useState(false);
  const [checking, setChecking] = useState(true);

  // Helper: safely read from both ?query and #hash params
  const getAllParams = () => {
    const query = new URLSearchParams(window.location.search);
    const hashStr = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hash = new URLSearchParams(hashStr);

    const get = (k: string) => query.get(k) ?? hash.get(k);

    return {
      type: get("type"),
      access_token: get("access_token"),
      refresh_token: get("refresh_token"),
      code: query.get("code"), // PKCE-style arrives in ?code
    };
  };

  useEffect(() => {
    const doSessionSetup = async () => {
      try {
        const { type, access_token, refresh_token, code } = getAllParams();

        // 1) PKCE-style: ?code=... (no access_token in URL)
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (error) {
            console.error("exchangeCodeForSession error:", error);
            throw new Error("Invalid or expired reset code.");
          }
          setIsValidReset(true);
          setChecking(false);
          return;
        }

        // 2) Classic recovery link in hash: #access_token=...&refresh_token=...&type=recovery
        if (type === "recovery" && access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            console.error("setSession error:", error);
            throw new Error("Invalid or expired reset link.");
          }
          setIsValidReset(true);
          setChecking(false);
          return;
        }

        // 3) If the user clicked the email but router stripped the hash
        // or we didn't match either flow:
        throw new Error("Missing reset parameters in the URL.");
      } catch (err: any) {
        toast({
          title: "Invalid Reset Link",
          description:
            err?.message ||
            "This password reset link is invalid or expired. Please request a new one.",
          variant: "destructive",
        });
        setIsValidReset(false);
        setChecking(false);
      }
    };

    doSessionSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While we verify tokens/sessions
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If invalid, send them back after showing toast
  if (!isValidReset) {
    // small delay so the toast is visible before route change
    setTimeout(() => navigate("/auth"), 100);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <AuthHeader />
      <Card className="w-full max-w-md">
        <PasswordResetForm
          onSuccess={() => {
            toast({
              title: "Password Updated Successfully!",
              description:
                "Your password has been updated. You are now signed in.",
            });
            navigate("/dashboard");
          }}
        />
      </Card>
      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ResetPassword;