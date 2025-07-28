
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Scan, FileText, Loader2 } from 'lucide-react';
import CameraCapture from '@/components/mobile/CameraCapture';
import { supabase } from '@/integrations/supabase/client';

interface ExpenseReceiptUploadProps {
  receiptUrl: string | undefined;
  setReceiptUrl: (url: string | undefined) => void;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
  isProcessingDocument: boolean;
  setIsProcessingDocument: (loading: boolean) => void;
  onReceiptProcessed: (data: any) => void;
}

const ExpenseReceiptUpload: React.FC<ExpenseReceiptUploadProps> = ({
  receiptUrl,
  setReceiptUrl,
  isUploading,
  setIsUploading,
  isProcessingDocument,
  setIsProcessingDocument,
  onReceiptProcessed
}) => {
  const { toast } = useToast();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (data:image/jpeg;base64,) 
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processDocumentWithGemini = async (file: File) => {
    try {
      setIsProcessingDocument(true);
      
      toast({
        title: "Processing Document",
        description: "Extracting expense data from your document..."
      });

      const base64Data = await convertFileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('gemini-receipt-ocr', {
        body: { imageBase64: base64Data }
      });

      if (error) {
        console.error('OCR processing error:', error);
        throw new Error(error.message || 'Failed to process document');
      }

      if (data?.success && data?.data) {
        onReceiptProcessed(data.data);
        toast({
          title: "Document Processed!",
          description: "Expense data extracted successfully from your document"
        });
      } else {
        throw new Error('Failed to extract data from document');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Processing Error", 
        description: "Could not extract data from document. You can still add the expense manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingDocument(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      console.log('File selected:', file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        throw new Error('Please select an image or PDF file');
      }
      
      // Create object URL for immediate preview
      const fileUrl = URL.createObjectURL(file);
      setReceiptUrl(fileUrl);
      
      console.log('File URL created:', fileUrl);
      
      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been attached to this expense."
      });

      // Process with Gemini AI for expense data extraction if it's an image
      if (file.type.startsWith('image/')) {
        await processDocumentWithGemini(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "There was an issue uploading your receipt.",
        variant: "destructive"
      });
      setReceiptUrl(undefined);
    } finally {
      setIsUploading(false);
    }
  };

  const handleScan = () => {
    setIsUploading(true);
    
    toast({
      title: "Accessing Camera",
      description: "Please allow camera access to scan your receipt."
    });
    
    setTimeout(() => {
      setReceiptUrl("/placeholder.svg");
      setIsUploading(false);
      
      toast({
        title: "Receipt Scanned",
        description: "Your receipt has been scanned and attached to this expense."
      });
    }, 1500);
  };

  const removeReceipt = () => {
    setReceiptUrl(undefined);
    toast({
      title: "Receipt Removed",
      description: "The receipt has been removed from this expense."
    });
  };

  return (
    <div className="space-y-2">
      <Label>Receipt & Document Upload</Label>
      
      {!receiptUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center space-y-4">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium mb-2">Add Receipt or Document</h3>
              <p className="text-sm text-gray-600 mb-1">
                Upload receipts, invoices, or expense documents
              </p>
              <p className="text-xs text-gray-500 mb-4">
                AI will automatically extract expense details
              </p>
            </div>
            
            <div className="mb-4">
              <CameraCapture
                onImageCaptured={(imageUri, photo) => {
                  setReceiptUrl(imageUri);
                }}
                onReceiptProcessed={onReceiptProcessed}
                disabled={isUploading || isProcessingDocument}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || isProcessingDocument}
                />
                <label htmlFor="receipt-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    asChild
                    disabled={isUploading || isProcessingDocument}
                  >
                    <div>
                      {isProcessingDocument ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {isProcessingDocument ? 'Processing...' : 'Upload File'}
                    </div>
                  </Button>
                </label>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleScan}
                disabled={isUploading || isProcessingDocument}
                className="w-full"
              >
                <Scan className="mr-2 h-4 w-4" />
                Scan Receipt
              </Button>
            </div>
            
            {(isUploading || isProcessingDocument) && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {isProcessingDocument ? 'AI is reading your document...' : 'Uploading...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-3">
          <div className="aspect-[4/3] bg-muted rounded-md mb-3 overflow-hidden">
            <img 
              src={receiptUrl} 
              alt="Receipt" 
              className="w-full h-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={removeReceipt}
            className="w-full"
          >
            Remove Receipt
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExpenseReceiptUpload;
