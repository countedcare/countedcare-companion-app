import React, { useState, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Mail, Copy, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AddReceiptSheetProps {
  expenseId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onReceiptAdded: (receiptUrl: string) => void;
}

interface OCRMismatch {
  field: string;
  receiptValue: string;
  transactionValue: string;
}

export const AddReceiptSheet = ({
  expenseId,
  isOpen,
  onClose,
  onReceiptAdded
}: AddReceiptSheetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [ocrMismatches, setOcrMismatches] = useState<OCRMismatch[]>([]);
  const [showMismatchDialog, setShowMismatchDialog] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const RECEIPT_EMAIL = 'receipts@countedcare.com';

  const handleCameraCapture = () => {
    // On mobile, this will open the camera
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('accept', 'image/*,application/pdf');
      fileInputRef.current.click();
    }
  };

  const handleEmailForward = async () => {
    try {
      await navigator.clipboard.writeText(RECEIPT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast({
        title: "Email copied!",
        description: `Forward your receipts to ${RECEIPT_EMAIL}`,
      });
    } catch (error) {
      toast({
        title: "Email address",
        description: RECEIPT_EMAIL,
      });
    }
  };

  const uploadFile = async (file: File) => {
    if (!user || !expenseId) return null;

    setUploading(true);
    try {
      // Generate filename with user ID prefix
      const fileExt = file.name.split('.').pop();
      const fileName = `${new Date().toISOString().slice(0, 10)}_${expenseId.slice(0, 8)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Run OCR validation with file path (not URL)
      await performOCRValidation(file, uploadData.path);

      return uploadData.path; // Return path instead of URL
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const performOCRValidation = async (file: File, receiptUrl: string) => {
    try {
      // For now, we'll simulate OCR validation
      // In a real implementation, you'd call your OCR service here
      
      // Simulate some mismatches for demo purposes
      const simulatedMismatches: OCRMismatch[] = [];
      
      // You would implement actual OCR here using Google Vision API or similar
      // const ocrResult = await callOCRService(file);
      // Then compare with transaction data and populate mismatches
      
      if (simulatedMismatches.length > 0) {
        setOcrMismatches(simulatedMismatches);
        setShowMismatchDialog(true);
      } else {
        // No mismatches, proceed with saving
        await saveReceiptToExpense(receiptUrl);
      }
    } catch (error) {
      console.error('OCR validation failed:', error);
      // Even if OCR fails, save the receipt
      await saveReceiptToExpense(receiptUrl);
    }
  };

  const saveReceiptToExpense = async (receiptUrl: string) => {
    if (!user || !expenseId) return;

    try {
      // Update expense with receipt URL
      const { error } = await supabase
        .from('expenses')
        .update({
          receipt_urls: [receiptUrl],
          receipt_required_at: null, // Clear reminder
          updated_at: new Date().toISOString()
        })
        .eq('id', expenseId)
        .eq('user_id', user.id);

      if (error) throw error;

      onReceiptAdded(receiptUrl);
      onClose();

      toast({
        title: "Receipt attached!",
        description: "Receipt has been successfully attached to your expense.",
      });
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast({
        title: "Save failed",
        description: "Failed to attach receipt to expense.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please choose an image or PDF file.",
        variant: "destructive"
      });
      return;
    }

    const receiptUrl = await uploadFile(file);
    if (receiptUrl) {
      // OCR validation will handle the rest
    }
  };

  const handleKeepValues = () => {
    setShowMismatchDialog(false);
    const receiptUrl = ''; // You'd have this from the upload
    saveReceiptToExpense(receiptUrl);
  };

  const handleUpdateFromReceipt = () => {
    setShowMismatchDialog(false);
    // Update transaction values from OCR results
    // Then save receipt
    const receiptUrl = ''; // You'd have this from the upload
    saveReceiptToExpense(receiptUrl);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader className="space-y-4">
            <SheetTitle className="text-left">Add Receipt</SheetTitle>
            <SheetDescription className="text-left">
              Attach a receipt to verify this expense for tax purposes.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-4">
            {/* Upload Options */}
            <div className="space-y-3">
              <Card 
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={handleCameraCapture}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Scan receipt</div>
                    <div className="text-sm text-muted-foreground">
                      Use camera with auto-crop
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={handleFileUpload}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Upload from device</div>
                    <div className="text-sm text-muted-foreground">
                      Choose image or PDF file
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={handleEmailForward}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Email later</div>
                    <div className="text-sm text-muted-foreground">
                      Forward to {RECEIPT_EMAIL}
                    </div>
                  </div>
                  {copiedEmail ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </Card>
            </div>

            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Uploading receipt...</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </SheetContent>
      </Sheet>

      {/* OCR Mismatch Dialog */}
      <Sheet open={showMismatchDialog} onOpenChange={setShowMismatchDialog}>
        <SheetContent side="bottom">
          <SheetHeader className="space-y-4">
            <SheetTitle className="text-left flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              Receipt differs from transaction
            </SheetTitle>
            <SheetDescription className="text-left">
              The receipt information doesn't match the transaction. What would you like to do?
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-4">
            {ocrMismatches.map((mismatch, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-medium capitalize mb-2">{mismatch.field}</div>
                <div className="text-sm space-y-1">
                  <div>Transaction: {mismatch.transactionValue}</div>
                  <div>Receipt: {mismatch.receiptValue}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleKeepValues}
            >
              Keep current values
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdateFromReceipt}
            >
              Update from receipt
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};