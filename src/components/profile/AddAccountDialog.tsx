import React, { useState, useEffect } from "react";
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
  const { addAccount } = useLinkedAccounts();
  const { toast } = useToast();
  const { user } = useAuth();

  // Manual form state
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Plaid state
  const [plaidReady, setPlaidReady] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(false);

  // Load Plaid script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).Plaid) {
      setPlaidReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => setPlaidReady(true);
    script.onerror = () => {
      setPlaidReady(false);
      toast({
        title: "Error loading Plaid",
        description: "Please try again later.",
        variant: "destructive",
      });
    };
    document.head.appendChild(script);
  }, [toast]);

  const handlePlaidConnect = async () => {
    if (!user || !plaidReady) return;

    try {
      setPlaidLoading(true);
      
      // Get link token
      const { data, error } = await supabase.functions.invoke("plaid-financial-connections", {
        body: { action: "create_link_token", user_id: user.id },
      });

      if (error || !data?.link_token) {
        throw new Error("Failed to create link token");
      }

      // Create and open Plaid handler
      const handler = (window as any).Plaid.create({
        token: data.link_token,
        onSuccess: async (public_token: string, metadata: any) => {
          try {
            const { error: exchangeError } = await supabase.functions.invoke("plaid-financial-connections", {
              body: {
                action: "exchange_public_token",
                public_token,
                account_name: metadata?.institution?.name || "Connected Account",
              },
            });

            if (exchangeError) throw exchangeError;

            toast({ 
              title: "Account connected", 
              description: "Your bank account has been linked successfully." 
            });
            
            onOpenChange(false);
            window.location.reload();
          } catch (err) {
            console.error("Exchange error:", err);
            toast({
              title: "Connection failed",
              description: "Failed to complete account connection.",
              variant: "destructive",
            });
          }
        },
        onExit: (err: any) => {
          if (err) {
            console.error("Plaid exit error:", err);
            toast({
              title: "Connection cancelled",
              description: "Account connection was cancelled.",
              variant: "destructive",
            });
          }
          setPlaidLoading(false);
        },
      });

      handler.open();
    } catch (error) {
      console.error("Plaid connect error:", error);
      toast({
        title: "Connection failed",
        description: "Failed to start account connection.",
        variant: "destructive",
      });
      setPlaidLoading(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button onClick={handlePlaidConnect} disabled={plaidLoading || !plaidReady} className="w-full">
              {plaidLoading ? "Connecting..." : "Connect with Plaid"}
            </Button>
            {!plaidReady && (
              <p className="text-xs text-muted-foreground text-center">
                Loading Plaid service...
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
                {loading ? "Adding..." : "Add Account"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;