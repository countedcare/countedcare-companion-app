import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Scan, FileText, Loader2 } from 'lucide-react';
import { CameraService } from '@/services/cameraService';
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

  // 🔄 Convert file to base64 for Gemini OCR
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 🔄 Process receipt with Gemini
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

      if (error) throw new Error(error.message || 'Failed to process document');

      if (data?.success && data?.data) {
        onReceiptProcessed(data.data);
        toast({
          title: "Document Processed!",
          description: "Expense data extracted successfully."
        });
      } else {
        throw new Error('Failed to extract data from document');
      }
    } catch {
      toast({
        title: "Processing Error", 
        description: "Could not extract data from document. You can still add the expense manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingDocument(false);
    }
  };

  // 🔄 Upload file to Supabase
  const uploadFileToSupabase = async (file: File) => {
    const filePath = `receipts/${Date.now()}-${file.name}`; // Save inside receipts folder
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);
    return filePath; // Return stored file path
  };

  // 🔄 Preview component for receipts
  const ReceiptPreview = ({ filePath }: { filePath: string }) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const getSignedUrl = async () => {
        setIsLoading(true);

        // Use directly if already a full URL or local blob
        if (filePath.startsWith('http') || filePath.startsWith('blob:') || filePath.startsWith('/')) {
          setSignedUrl(filePath);
          setIsLoading(false);
          return;
        }

        // Get signed URL from Supabase
        const { data, error } = await supabase.storage
          .from('receipts')
          .createSignedUrl(filePath, 60 * 60); // 1 hour

        if (error) {
          console.error('Error getting signed URL:', error.message);
          setSignedUrl(null);
        } else {
          setSignedUrl(data?.signedUrl || null);
        }
        setIsLoading(false);
      };

      if (filePath) getSignedUrl();
    }, [filePath]);

    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!signedUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
          Failed to load preview
        </div>
      );
    }

    return filePath.toLowerCase().includes('.pdf') ? (
      <embed src={signedUrl} type="application/pdf" className="w-full h-full" style={{ minHeight: '300px' }} />
    ) : (
      <img src={signedUrl} alt="Receipt" className="w-full h-full object-contain" />
    );
  };

  // 🔄 Handle file upload event
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        throw new Error('Please select an image or PDF file');
      }

      const uploadedFilePath = await uploadFileToSupabase(file);
      setReceiptUrl(uploadedFilePath);

      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been uploaded successfully."
      });

      if (file.type.startsWith('image/')) {
        await processDocumentWithGemini(file);
      }
    } catch (error) {
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

  // 🔄 Handle camera capture
  const handleCameraCapture = async () => {
    try {
      setIsUploading(true);
      
      const hasPermission = await CameraService.requestPermissions();
      if (!hasPermission) {
        toast({
          title: "Permission Required",
          description: "Camera permission is needed to take photos",
          variant: "destructive"
        });
        return;
      }

      const photo = await CameraService.takePicture();
      if (photo.webPath) {
        setReceiptUrl(photo.webPath);
        
        toast({
          title: "Photo Captured",
          description: "Receipt photo captured successfully"
        });

        // Auto-process with Gemini if it's an image
        await processDocumentWithGemini(photo as any);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast({
        title: "Camera Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 🔄 Handle gallery selection
  const handleGalleryPick = async () => {
    try {
      setIsUploading(true);
      
      const photo = await CameraService.pickFromGallery();
      if (photo.webPath) {
        setReceiptUrl(photo.webPath);
        
        toast({
          title: "Photo Selected",
          description: "Receipt photo selected from gallery"
        });

        // Auto-process with Gemini if it's an image
        await processDocumentWithGemini(photo as any);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      toast({
        title: "Gallery Error",
        description: "Failed to select photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 🔄 Remove receipt
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraCapture}
                  disabled={isUploading || isProcessingDocument}
                  className="w-full"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGalleryPick}
                  disabled={isUploading || isProcessingDocument}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Gallery
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*,.pdf"
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
                onClick={handleCameraCapture}
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
            <ReceiptPreview filePath={receiptUrl} />
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
