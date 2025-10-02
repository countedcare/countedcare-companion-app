import React, { useState, useRef, useEffect } from 'react';
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
import { fileToDataUrl, runReceiptOcr } from '@/lib/ocrClient';
import ReceiptViewer from './ReceiptViewer';

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

  // Sync with existing receipts when they change (e.g., when editing an expense)
  useEffect(() => {
    setReceipts(existingReceipts);
  }, [existingReceipts]);

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
  const processReceiptOCR = async (file: File) => {
    if (!onReceiptProcessed) return;
    
    setIsProcessingOCR(true);
    
    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await runReceiptOcr(dataUrl);
      
      // Pass extracted data to parent component
      onReceiptProcessed({
        merchant: result.vendor,
        vendor: result.vendor,
        amount: result.amount,
        date: result.date,
        category: result.category,
        description: `Receipt from ${result.vendor}`,
      });
      
      toast({
        title: "Receipt Processed!",
        description: "Information extracted successfully. Please review and adjust as needed.",
      });
    } catch (err) {
      console.error('OCR error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not extract data. You can still enter it manually.';
      toast({
        title: "OCR Processing Failed",
        description: errorMessage,
        variant: "destructive",
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

      // Get public URL (bucket is now public)
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

      // Process with OCR for both images and PDFs
      if (onReceiptProcessed) {
        await processReceiptOCR(fileObj.file);
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
          <Label className="text-sm font-medium">Uploaded Receipts</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {receipts.map((receiptUrl, index) => {
              const isPdf = receiptUrl.endsWith('.pdf');
              return (
                <Card key={receiptUrl} className="overflow-hidden">
                  {/* Image Preview */}
                  {!isPdf && (
                    <div className="relative w-full h-48 bg-muted">
                      <img 
                        src={receiptUrl} 
                        alt={`Receipt ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  {/* PDF Indicator */}
                  {isPdf && (
                    <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="p-3 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Receipt {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {isPdf ? 'PDF Document' : 'Image'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ReceiptViewer
                          receipts={[receiptUrl]}
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              title="View full size"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExistingReceipt(receiptUrl)}
                          title="Remove receipt"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Uploading Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Processing</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uploadedFiles.map((fileObj, index) => {
              const isPdf = fileObj.file.type === 'application/pdf';
              return (
                <Card key={index} className="overflow-hidden">
                  {/* Image Preview or PDF Placeholder */}
                  <div className="relative w-full h-48 bg-muted">
                    {!isPdf && fileObj.preview ? (
                      <img 
                        src={fileObj.preview} 
                        alt={fileObj.file.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Upload Status Overlay */}
                    {fileObj.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm font-medium">{fileObj.progress}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="p-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileObj.file.name}</p>
                        <div className="mt-1">
                          {fileObj.status === 'uploading' && (
                            <Progress value={fileObj.progress} className="h-2" />
                          )}
                          {fileObj.status === 'error' && (
                            <p className="text-xs text-destructive">{fileObj.error}</p>
                          )}
                          {fileObj.status === 'success' && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Upload complete
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index, fileObj.url)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
