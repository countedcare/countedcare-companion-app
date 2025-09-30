import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, X, Eye, Download, FileText, Image as ImageIcon, 
  Loader2, Camera, Trash2, Plus, CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ReceiptUploadProps {
  expenseId?: string;
  existingReceipts?: string[];
  onReceiptsChange?: (receipts: string[]) => void;
  onReceiptProcessed?: (data: any) => void;
  maxFiles?: number;
  className?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  expenseId,
  existingReceipts = [],
  onReceiptsChange,
  onReceiptProcessed,
  maxFiles = 5,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [receipts, setReceipts] = useState<string[]>(existingReceipts);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || !user) return;

    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isValidType = isImage || isPDF;
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload images (PNG, JPG, WebP) or PDF files.",
          variant: "destructive"
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} receipts.`,
        variant: "destructive"
      });
      return;
    }

    // Create preview objects and start upload
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload each file
    newFiles.forEach((fileObj, index) => {
      uploadFile(fileObj, uploadedFiles.length + index);
    });
  };

  // Process receipt with OCR
  const processReceiptOCR = async (imageUrl: string) => {
    if (!onReceiptProcessed) return;
    
    setIsProcessingOCR(true);
    
    try {
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
      
      const base64Data = (reader.result as string).split(',')[1];
      
      // Call OCR edge function
      const { data: ocrResult, error: ocrError } = await supabase.functions.invoke('gemini-receipt-ocr', {
        body: { imageBase64: base64Data }
      });
      
      if (ocrError) throw ocrError;
      
      if (ocrResult?.success && ocrResult?.data) {
        // Pass extracted data to parent component
        onReceiptProcessed({
          merchant: ocrResult.data.vendor,
          vendor: ocrResult.data.vendor,
          amount: ocrResult.data.amount,
          date: ocrResult.data.date,
          category: ocrResult.data.category,
          description: `Receipt from ${ocrResult.data.vendor}`,
        });
        
        toast({
          title: "Receipt Processed!",
          description: "Information extracted successfully. Please review and adjust as needed.",
        });
      } else {
        throw new Error('OCR processing failed');
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "OCR Processing Failed",
        description: "Could not extract information from receipt. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Upload file to Supabase storage
  const uploadFile = async (fileObj: UploadedFile, index: number) => {
    if (!user) return;

    try {
      const fileExt = fileObj.file.name.split('.').pop();
      const fileName = `${user.id}/${expenseId || 'temp'}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Update progress
      updateFileStatus(index, { progress: 10 });

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, fileObj.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Update progress
      updateFileStatus(index, { progress: 60 });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      const newReceipts = [...receipts, urlData.publicUrl];
      setReceipts(newReceipts);
      onReceiptsChange?.(newReceipts);

      // Update file status to success
      updateFileStatus(index, { 
        status: 'success', 
        progress: 100, 
        url: urlData.publicUrl 
      });

      toast({
        title: "Receipt uploaded",
        description: "Processing with OCR...",
      });

      // Process with OCR (only for images, not PDFs)
      if (fileObj.file.type.startsWith('image/') && onReceiptProcessed) {
        await processReceiptOCR(urlData.publicUrl);
      }

    } catch (error) {
      console.error('Upload error:', error);
      updateFileStatus(index, { 
        status: 'error', 
        error: 'Upload failed. Please try again.' 
      });
      
      toast({
        title: "Upload failed",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update file status helper
  const updateFileStatus = (index: number, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => 
      prev.map((file, i) => i === index ? { ...file, ...updates } : file)
    );
  };

  // Remove uploaded file
  const removeFile = async (index: number, url?: string) => {
    if (url) {
      // Remove from Supabase storage
      const fileName = url.split('/').pop();
      if (fileName) {
        try {
          await supabase.storage.from('receipts').remove([`${user?.id}/${fileName}`]);
        } catch (error) {
          console.error('Error removing file:', error);
        }
      }

      // Remove from receipts array
      const newReceipts = receipts.filter(receipt => receipt !== url);
      setReceipts(newReceipts);
      onReceiptsChange?.(newReceipts);
    }

    // Remove from uploaded files
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Clean up preview URL
      const fileToRemove = prev[index];
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return newFiles;
    });
  };

  // Remove existing receipt
  const removeExistingReceipt = async (receiptUrl: string) => {
    try {
      // Extract file name from URL and remove from storage
      const fileName = receiptUrl.split('/').pop();
      if (fileName && user) {
        await supabase.storage.from('receipts').remove([`${user.id}/${fileName}`]);
      }

      const newReceipts = receipts.filter(receipt => receipt !== receiptUrl);
      setReceipts(newReceipts);
      onReceiptsChange?.(newReceipts);

      toast({
        title: "Receipt removed",
        description: "Receipt has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing receipt:', error);
      toast({
        title: "Error",
        description: "Failed to remove receipt. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // View receipt
  const viewReceipt = (url: string) => {
    window.open(url, '_blank');
  };

  const totalReceipts = receipts.length + uploadedFiles.filter(f => f.status === 'success').length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* OCR Processing Indicator */}
      {isProcessingOCR && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800">Extracting information from receipt...</span>
        </div>
      )}
      
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          totalReceipts >= maxFiles ? "opacity-50 pointer-events-none" : ""
        )}
      >
        <CardContent 
          className="p-6 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Upload Receipt with OCR</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: JPG, PNG, WebP, PDF (max 10MB each)
              </p>
              <p className="text-xs text-primary font-medium mt-2">
                ✨ Images: Auto-fills with AI | PDFs: Attach for records
              </p>
            </div>
            <Badge variant="outline">
              {totalReceipts}/{maxFiles} receipts
            </Badge>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Existing Receipts */}
      {receipts.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Existing Receipts</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {receipts.map((receiptUrl, index) => (
              <Card key={receiptUrl} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md bg-green-100">
                      {receiptUrl.endsWith('.pdf') ? (
                        <FileText className="h-4 w-4 text-green-600" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Receipt {index + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {receiptUrl.endsWith('.pdf') ? 'PDF Document' : 'Image'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewReceipt(receiptUrl)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeExistingReceipt(receiptUrl)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Uploading Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploading</Label>
          <div className="space-y-3">
            {uploadedFiles.map((fileObj, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md bg-blue-100">
                      {fileObj.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      )}
                      {fileObj.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {fileObj.status === 'error' && (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{fileObj.file.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {fileObj.status === 'uploading' && (
                          <Progress value={fileObj.progress} className="h-2 flex-1" />
                        )}
                        {fileObj.status === 'error' && (
                          <p className="text-xs text-red-600">{fileObj.error}</p>
                        )}
                        {fileObj.status === 'success' && (
                          <p className="text-xs text-green-600">Upload complete</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index, fileObj.url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
