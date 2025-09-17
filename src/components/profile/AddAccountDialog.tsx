import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLinkedAccounts } from "@/hooks/useLinkedAccounts";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ACCOUNT_TYPES } from "@/types/FinancialAccount";
import { CreditCard } from "lucide-react";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Key improvements:
 * - Load Plaid script once (per app session) and memoize readiness
 * - Create handler once per link_token; guard against double-open
 * - Cache link_token for the current open cycle so multiple clicks don't re-create
 * - Cleanup handler on unmount; remove dangling listeners
 * - Prevent closing dialog while Plaid flow is in-flight
 */
const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, onOpenChange }) => {
  const { addAccount /*, refresh */ } = useLinkedAccounts(); // if your hook exposes `refresh`, prefer it over reload
  const { toast } = useToast();
  const { user } = useAuth();

  // Manual form
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [institutionName, setInstitutionName] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(false);

  // Plaid
  const [plaidReady, setPlaidReady] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Refs to prevent duplicate actions
  const handlerRef = useRef<any>(null);
  const openingRef = useRef(false); // avoid calling handler.open() multiple times per token
  const mountedRef = useRef(false);

  // Mount guard
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        // Close and cleanup Plaid handler on unmount
        if (handlerRef.current?.destroy) handlerRef.current.destroy();
      } catch {
        /* no-op */
      }
      handlerRef.current = null;
    };
  }, []);

  // Load Plaid script once globally
  useEffect(() => {
    if (typeof window === "undefined") return;

    // already present?
    if ((window as any).Plaid) {
      setPlaidReady(true);
      return;
    }

    // check existing tag
    const existing = document.querySelector('script[src*="cdn.plaid.com/link/v2/stable/link-initialize.js"]');
    if (existing) {
      existing.addEventListener("load", () => setPlaidReady(true), { once: true });
      existing.addEventListener("error", () => setPlaidReady(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => setPlaidReady(true);
    script.onerror = () => {
      setPlaidReady(false);
      toast({
        title: "Couldn’t load Plaid",
        description: "Check your internet connection and try again.",
        variant: "destructive",
      });
    };
    document.head.appendChild(script);
  }, [toast]);

  // When dialog opens: fetch a link_token (once per open cycle)
  useEffect(() => {
    if (!open) {
      // reset open-cycle state
      setLinkToken(null);
      openingRef.current = false;
      return;
    }
    if (!user) return;

    let cancelled = false;

    const getLinkToken = async () => {
      try {
        setPlaidLoading(true);
        const { data, error } = await supabase.functions.invoke("plaid-financial-connections", {
          body: { action: "create_link_token", user_id: user.id },
        });
        if (error) throw error;
        if (!data?.link_token) throw new Error("No link_token returned");
        if (!cancelled) setLinkToken(data.link_token);
      } catch (e: any) {
        console.error("create_link_token error:", e);
        toast({
          title: "Error",
          description: e?.message || "Failed to initialize bank connection.",
          variant: "destructive",
        });
      } finally {
        if (mountedRef.current) setPlaidLoading(false);
      }
    };

    getLinkToken();

    return () => {
      cancelled = true;
    };
  }, [open, user, toast]);

  // Create Plaid handler when both script & token are ready
  useEffect(() => {
    if (!plaidReady || !linkToken) return;

    try {
      if (!(window as any).Plaid) throw new Error("Plaid SDK not found on window.");
      // Destroy prior handler if any (defensive)
      if (handlerRef.current?.destroy) handlerRef.current.destroy();

      handlerRef.current = (window as any).Plaid.create({
        token: linkToken,
        onSuccess: async (public_token: string, metadata: any) => {
          try {
            toast({ title: "Processing connection…", description: "Exchanging tokens…" });

            // Exchange public_token → access_token on your edge function
            const { error } = await supabase.functions.invoke("plaid-financial-connections", {
              body: {
                action: "exchange_public_token",
                public_token,
                account_name: metadata?.institution?.name || "Connected Account",
              },
            });

            if (error) throw error;

            toast({ title: "Bank connected", description: "Your account is linked successfully." });

            // If your accounts hook exposes a refresh function, prefer that:
            // await refresh?.();
            // Otherwise fall back to a lightweight reload:
            try {
              onOpenChange(false);
            } finally {
              // As a last resort:
              if (typeof window !== "undefined" && !process.env.NODE_ENV?.includes("test")) {
                window.location.reload();
              }
            }
          } catch (err) {
            console.error("onSuccess/exchange error:", err);
            toast({
              title: "Connection error",
              description: "Failed to complete bank connection.",
              variant: "destructive",
            });
          } finally {
            openingRef.current = false;
          }
        },
        onExit: (err: any, metadata: any) => {
          // User closed or error occurred
          if (err) {
            console.error("Plaid onExit error:", err, metadata);
            toast({
              title: "Connection cancelled",
              description: "Bank connection was cancelled or failed.",
              variant: "destructive",
            });
          }
          openingRef.current = false;
        },
        onEvent: (eventName: string, metadata: any) => {
          // Useful for debugging
          // console.log("Plaid event:", eventName, metadata);
        },
      });
    } catch (e) {
      console.error("Plaid.create error:", e);
      toast({
        title: "Error",
        description: "Failed to initialize bank connection.",
        variant: "destructive",
      });
    }
  }, [plaidReady, linkToken, onOpenChange, toast]);

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName || !accountType) {
      toast({
        title: "Missing fields",
        description: "Please fill in account name and type.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addAccount({
        account_name: accountName,
        account_type: accountType as any,
        institution_name: institutionName || undefined,
        is_active: true,
      });

      setAccountName("");
      setAccountType("");
      setInstitutionName("");
      onOpenChange(false);
      toast({ title: "Account added", description: "Your account was added successfully." });
    } catch (error: any) {
      console.error("Error adding account:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openPlaid = useCallback(() => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You must be logged in to connect bank accounts.",
        variant: "destructive",
      });
      return;
    }
    if (!plaidReady) {
      toast({ title: "Please wait", description: "Loading bank connection service…" });
      return;
    }
    if (!linkToken) {
      toast({ title: "Please wait", description: "Preparing a secure connection…" });
      return;
    }
    if (!handlerRef.current) {
      toast({
        title: "Initialization error",
        description: "Bank connection is not ready yet. Try again.",
        variant: "destructive",
      });
      return;
    }
    if (openingRef.current) return; // guard
    openingRef.current = true;
    try {
      handlerRef.current.open();
    } catch (e) {
      openingRef.current = false;
      console.error("handler.open error:", e);
      toast({
        title: "Error",
        description: "Failed to open bank connection window.",
        variant: "destructive",
      });
    }
  }, [user, plaidReady, linkToken, toast]);

  // Prevent closing while plaid flow is in flight (optional but safer UX)
  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen && (plaidLoading || openingRef.current)) {
      // ignore close while connecting
      return;
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Financial Account</DialogTitle>
          <DialogDescription>Connect your bank accounts to automatically track expenses.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plaid Connect */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Connect Bank Account</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Securely connect your bank account to automatically import and categorize transactions.
            </p>
            <Button onClick={openPlaid} disabled={plaidLoading || !plaidReady} className="w-full">
              {plaidLoading ? "Preparing…" : "Connect with Plaid"}
            </Button>
            {!plaidReady && (
              <p className="text-xs text-muted-foreground text-center">
                Loading Plaid… this only takes a moment.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or add manually</span>
            </div>
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleSubmitManual} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name *</Label>
              <Input
                id="account-name"
                placeholder="e.g., Chase Checking"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-type">Account Type *</Label>
              <Select value={accountType} onValueChange={setAccountType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution-name">Bank/Institution Name</Label>
              <Input
                id="institution-name"
                placeholder="e.g., Chase Bank"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Adding…" : "Add Account"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
