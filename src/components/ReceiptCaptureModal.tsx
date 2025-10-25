import React, { useEffect, useRef, useState } from "react";
import { Camera, Upload, X, DollarSign, Calendar as CalendarIcon, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"; // align with shadcn path
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EXPENSE_CATEGORIES } from "@/types/User";
import { CameraService } from "@/services/cameraService";
import { Capacitor } from "@capacitor/core";

interface ReceiptCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

interface TaxDeductibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResponse: (response: boolean | null) => void;
}

const TaxDeductibilityModal: React.FC<TaxDeductibilityModalProps> = ({ isOpen, onClose, onResponse }) => {
  const handleResponse = (response: boolean | null) => {
    onResponse(response);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Tax Deduction Question</DialogTitle>
          <DialogDescription className="text-center">
            Help us categorize this expense for tax purposes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">Do you think this expense might qualify for a tax deduction?</p>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => handleResponse(true)} className="w-full">
              Yes, it might be deductible
            </Button>
            <Button onClick={() => handleResponse(false)} variant="outline" className="w-full">
              No, probably not deductible
            </Button>
            <Button onClick={() => handleResponse(null)} variant="ghost" className="w-full">
              Not sure
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ReceiptCaptureModal: React.FC<ReceiptCaptureModalProps> = ({ isOpen, onClose, onExpenseAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const openedRef = useRef(false); // prevents multiple auto-opens per open cycle
  const mountedRef = useRef(false); // avoid setState on unmounted

  // steps
  const [step, setStep] = useState<"capture" | "details" | "tax-question">("capture");

  // ui state
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // form state
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // tax modal
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // mount/unmount guard
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auto-open camera once when modal opens on native mobile
  useEffect(() => {
    if (!isOpen) {
      openedRef.current = false;
      return;
    }
    if (openedRef.current) return;

    openedRef.current = true;
    if (isMobile && Capacitor.isNativePlatform()) {
      const t = setTimeout(() => {
        handleTakePhotoWithCapacitor();
      }, 350); // smaller delay to reduce perceived glitch
      return () => clearTimeout(t);
    }
  }, [isOpen, isMobile]);

  const photoToFile = async (photo: any): Promise<File> => {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" });
  };

  const handleTakePhotoWithCapacitor = async () => {
    try {
      setIsUploading(true);

      const hasPermission = await CameraService.requestPermissions();
      if (!hasPermission) {
        toast({
          title: "Camera permission required",
          description: "Please allow camera access to take photos of receipts.",
          variant: "destructive",
        });
        return;
      }

      const photo = await CameraService.takePicture();
      const file = await photoToFile(photo);
      await handleFileSelect(file);
    } catch (error: any) {
      console.error("Camera error:", error);
      if (error?.message !== "User cancelled photos app") {
        toast({
          title: "Camera error",
          description: "Failed to take photo. You can still upload from gallery.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) setIsUploading(false);
    }
  };

  const uploadReceiptToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage.from("receipts").upload(path, file, {
      upsert: false,
      contentType: file.type || "image/jpeg",
    });
    if (error) throw error;

    // Return the file path, not signed URL
    // Signed URLs will be generated when viewing
    return data.path;
  };

  const processReceiptWithOCR = async (file: File) => {
    setIsProcessingOCR(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(new Error("File read failed"));
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(",")[1] || "");
        };
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      const { data, error } = await supabase.functions.invoke("gemini-receipt-ocr", {
        body: { imageBase64 },
      });
      if (error) throw error;

      if (data?.success) {
        const ocr = data.data || {};
        setExtractedData(ocr);
        if (ocr.vendor) setVendor(String(ocr.vendor));
        if (ocr.amount) setAmount(String(ocr.amount));
        if (ocr.category) setCategory(String(ocr.category));
        if (ocr.date) setDate(String(ocr.date));

        toast({
          title: "Receipt processed",
          description: "We filled some fields for you. Please review.",
        });
      } else {
        throw new Error(data?.error || "OCR processing failed");
      }
    } catch (err) {
      console.error("OCR processing error:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not extract data. Please enter details manually.";
      toast({
        title: "OCR failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (mountedRef.current) setIsProcessingOCR(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadReceiptToStorage(file);
      setReceiptUrl(url);
      if (file.type.startsWith("image/")) {
        await processReceiptWithOCR(file);
      }
      setStep("details");
      toast({ title: "Receipt uploaded", description: "Processing receipt data..." });
    } catch (e) {
      console.error(e);
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      if (mountedRef.current) setIsUploading(false);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFileSelect(file);
    e.target.value = ""; // allow re-picking same file
  };

  const handleSubmitExpense = async () => {
    if (!user || !amount || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in amount and category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        amount: parseFloat(amount),
        category,
        vendor: vendor || undefined,
        date,
        description: notes || undefined,
        receipt_url: receiptUrl || undefined,
      });
      if (error) throw error;

      toast({ title: "Expense added", description: "Saved successfully." });
      setStep("tax-question");
      setShowTaxModal(true);
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  };

  const handleTaxDeductibilityResponse = async (response: boolean | null) => {
    try {
      if (user) {
        const { data: expenses, error: fetchError } = await supabase
          .from("expenses")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (fetchError) throw fetchError;

        if (expenses?.length) {
          const { error: updateError } = await supabase
            .from("expenses")
            .update({ is_potentially_deductible: response })
            .eq("id", expenses[0].id);
          if (updateError) throw updateError;
        }
      }
    } catch (e) {
      console.error("Error updating tax deductibility:", e);
    }

    onExpenseAdded?.();
    safeCloseAll();
  };

  // Reset all state
  const resetForm = () => {
    setStep("capture");
    setReceiptUrl("");
    setVendor("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setShowTaxModal(false);
    setExtractedData(null);
    setIsProcessingOCR(false);
  };

  // Close child + parent cleanly
  const safeCloseAll = () => {
    resetForm();
    onClose?.();
  };

  // Only close when switching from open -> false (prevents “glitch” while content changes)
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) safeCloseAll();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Capture and categorize your expense details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {step === "capture" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">Take a photo or upload a receipt to get started</p>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    onClick={() => {
                      if (isMobile && Capacitor.isNativePlatform()) {
                        void handleTakePhotoWithCapacitor();
                      } else {
                        cameraInputRef.current?.click();
                      }
                    }}
                    disabled={isUploading}
                  >
                    <Camera className="h-6 w-6" />
                    <span>Take Photo</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-6 w-6" />
                    <span>Upload File</span>
                  </Button>
                </div>

                {/* camera (rear) where supported */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePickerChange}
                  className="hidden"
                />
                {/* general picker (image/PDF) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePickerChange}
                  className="hidden"
                />

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/expenses/new");
                      safeCloseAll();
                    }}
                    className="flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    Add expense (manual entry form)
                  </Button>
                </div>

                {isUploading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {isMobile && Capacitor.isNativePlatform() ? "Opening camera..." : "Uploading receipt..."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4">
                {receiptUrl && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Receipt Preview</h3>
                          {/(\.pdf($|\?))/i.test(receiptUrl) ? (
                            <iframe src={receiptUrl} className="w-full h-60 rounded border" title="Receipt PDF" />
                          ) : (
                            <img src={receiptUrl} alt="Receipt" className="w-full h-60 object-contain bg-muted rounded border" />
                          )}
                        </div>

                        {isProcessingOCR && (
                          <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3" />
                            <span className="text-sm text-blue-700">Extracting receipt data...</span>
                          </div>
                        )}

                        {extractedData && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-green-800 mb-2">✓ Extracted Data</h4>
                            <div className="text-xs text-green-700 space-y-1">
                              {extractedData.vendor && (
                                <div>
                                  <strong>Vendor:</strong> {extractedData.vendor}
                                </div>
                              )}
                              {extractedData.amount && (
                                <div>
                                  <strong>Amount:</strong> ${extractedData.amount}
                                </div>
                              )}
                              {extractedData.date && (
                                <div>
                                  <strong>Date:</strong> {extractedData.date}
                                </div>
                              )}
                              {extractedData.category && (
                                <div>
                                  <strong>Category:</strong> {extractedData.category}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-green-600 mt-2 italic">
                              Form fields have been auto-populated. Please review and adjust as needed.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    type="text"
                    placeholder="e.g., Walgreens, UCLA Health"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setStep("capture")} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmitExpense} disabled={isSubmitting || !amount || !category} className="flex-1">
                    {isSubmitting ? "Saving…" : "Save Expense"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TaxDeductibilityModal
        isOpen={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        onResponse={handleTaxDeductibilityResponse}
      />
    </>
  );
};

export default ReceiptCaptureModal;
;
