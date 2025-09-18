import React, { useEffect, useRef, useState, useCallback } from "react";
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

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, onOpenChange }) => {
  const { addAccount /*, refresh*/ } = useLinkedAccounts();
  const { toast } = useToast();
  const { user } = useAuth();

  // Manual form
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [loading, setLoading] = useState(false);

  // Plaid state
  const [plaidReady, setPlaidReady] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Refs for handler + guards
  const handlerRef = useRef<any>(null);
  const openingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        handlerRef.current?.destroy?.();
      } catch {}
      handlerRef.current = null;
    };
  }, []);

  // Load Plaid script once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Plaid) {
      setPlaidReady(true);
      return;
    }
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

  // When dialog opens, fetch a link_token ONCE for this open cycle
  useEffect(() => {
    if (!open) {
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

  // Build handler when ready
  useEffect(() => {
    if (!plaidReady || !linkToken) return;
    try {
      if (!(window as any).Plaid) throw new Error("Plaid SDK missing on window");

      // destroy any previous handler
      handlerRef.current?.destroy?.();

      handlerRef.current = (window as any).Plaid.create({
        token: linkToken,
        onSuccess: async (public_token: string, metadata: any) => {
          try {
            toast({ title: "Processing…", description: "Finalizing bank connection." });
            const { data, error } = await supabase.functions.invoke("plaid-financial-connections", {
              body: {
                action: "exchange_public_token",
                public_token,
                account_name: metadata?.institution?.name || "Connected Account",
              },
            });
            if (error || data?.error) throw (error || new Error(data?.error));

            toast({ title: "Account connected", description: "Your bank account is linked." });
            onOpenChange(false);

            // Prefer a hook refresh if you have it; fallback to reload:
            // await refresh?.();
            if (typeof window !== "undefined") window.location.reload();
          } catch (err) {
            console.error("Exchange error:", err);
            toast({
              title: "Connection failed",
              description: "We couldn’t complete the bank connection.",
              variant: "destructive",
            });
          } finally {
            openingRef.current = false;
            if (mountedRef.current) setPlaidLoading(false);
          }
        },
        onExit: (err: any, metadata: any) => {
          if (err) {
            console.error("Plaid onExit error:", err, metadata);
            toast({
              title: "Connection cancelled",
              description: "You closed Plaid or an error occurred.",
              variant: "destructive",
            });
          }
          openingRef.current = false;
          if (mountedRef.current) setPlaidLoading(false);
        },
        onEvent: (eventName: string, metadata: any) => {
          // console.log("Plaid event:", eventName, metadata);
        },
      });
    } catch (e) {
      console.error("Plaid.create error:", e);
      toast({
        title: "Initialization error",
        description: "Failed to prepare the bank connection.",
        variant: "destructive",
      });
    }
  }, [plaidReady, linkToken, onOpenChange, toast]);

  const openPlaid = useCallback(() => {
    // Guard checks
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to link a bank account.",
        variant: "destructive",
      });
      return;
    }
    if (!plaidReady) {
      toast({ title: "Please wait", description: "Loading Plaid…" });
      return;
    }
    if (!linkToken || !handlerRef.current) {
      toast({ title: "Please wait", description: "Preparing secure connection…" });
      return;
    }
    if (openingRef.current) return;
    
    openingRef.current = true;
    setPlaidLoading(true);
    
    // Close the Radix dialog before opening Plaid
    onOpenChange(false);
    
    // Open Plaid on the next frame to ensure dialog is closed
    requestAnimationFrame(() => {
      try {
        handlerRef.current.open();
      } catch (e) {
        openingRef.current = false;
        setPlaidLoading(false);
        console.error("handler.open error:", e);
        toast({
          title: "Open failed",
          description: "Could not open the bank connection window.",
          variant: "destructive",
        });
      }
    });
  }, [user, plaidReady, linkToken, onOpenChange, toast]);

  // Prevent closing while Plaid is in-flight (optional)
  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen && (plaidLoading || openingRef.current)) return;
    onOpenChange(nextOpen);
  };

  // Manual add
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
      // await refresh?.();
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

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Financial Account</DialogTitle>
          <DialogDescription>Connect your bank account to import and categorize transactions automatically.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Connect Bank Account</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Use Plaid to securely connect your bank account.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-3">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                Sandbox credentials (for testing):
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Username: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">user_good</code> ·
                Password: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded ml-1">pass_good</code>
              </p>
            </div>
            <Button onClick={openPlaid} disabled={plaidLoading || !plaidReady} className="w-full">
              {plaidLoading ? "Connecting…" : "Connect with Plaid (Sandbox)"}
            </Button>
            {!plaidReady && (
              <p className="text-xs text-muted-foreground text-center">Loading Plaid…</p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or add manually</span>
            </div>
          </div>

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
