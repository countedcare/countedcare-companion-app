import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Scan, FileText, Loader2, RotateCw, ZoomIn, ZoomOut, Calendar as CalendarIcon } from 'lucide-react';
import { CameraService } from '@/services/cameraService';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel as ShadFormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/types/User';
interface ExpenseReceiptUploadProps {
  receiptUrl: string | undefined;
  setReceiptUrl: (url: string | undefined) => void;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
  isProcessingDocument: boolean;
  setIsProcessingDocument: (loading: boolean) => void;
  onReceiptProcessed?: (data: any) => void;
  onSave?: (expenseData: {
    vendor: string;
    category: string;
    amount: number;
    date: string;
    notes?: string;
    receiptUrl?: string;
    extractedValues: { vendor?: string; category?: string; amount?: number; date?: string };
    fieldConfidence: Record<string, number>;
  }) => void;
  initialValues?: {
    vendor?: string;
    category?: string;
    amount?: number;
    date?: string;
    notes?: string;
  };
}

const ExpenseReceiptUpload: React.FC<ExpenseReceiptUploadProps> = ({
  receiptUrl,
  setReceiptUrl,
  isUploading,
  setIsUploading,
  isProcessingDocument,
  setIsProcessingDocument,
  onReceiptProcessed,
  onSave,
  initialValues,
}) => {
  const { toast } = useToast();

  // Form schema and setup
  const FormSchema = z.object({
    vendor: z.string().min(1, 'Vendor is required'),
    category: z.string().min(1, 'Category is required'),
    amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be greater than 0')),
    date: z.date(),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vendor: '',
      category: '',
      amount: undefined as unknown as number,
      date: new Date(),
      notes: '',
    },
  });

  // Apply initial values if provided
  useEffect(() => {
    if (initialValues) {
      if (initialValues.vendor) form.setValue('vendor', initialValues.vendor);
      if (initialValues.category) form.setValue('category', initialValues.category);
      if (typeof initialValues.amount === 'number') form.setValue('amount', initialValues.amount);
      if (initialValues.date) form.setValue('date', new Date(initialValues.date));
      if (initialValues.notes) form.setValue('notes', initialValues.notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.vendor, initialValues?.category, initialValues?.amount, initialValues?.date, initialValues?.notes]);

  // Extraction results
  const [extractedValues, setExtractedValues] = useState<{ vendor?: string; category?: string; amount?: number; date?: string }>({});
  const [fieldConfidence, setFieldConfidence] = useState<Record<string, number>>({});

  // Preview controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Keep last uploaded/captured file for re-run extraction
  const [lastProcessedBlob, setLastProcessedBlob] = useState<Blob | null>(null);

  const applyExtractedToForm = (data: any) => {
    if (data.vendor) form.setValue('vendor', data.vendor);
    if (data.category) form.setValue('category', data.category);
    if (data.amount) form.setValue('amount', Number(data.amount));
    if (data.date) form.setValue('date', new Date(data.date));
  };

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
        const extracted = data.data;
        setExtractedValues({
          vendor: extracted.vendor,
          category: extracted.category,
          amount: extracted.amount ? Number(extracted.amount) : undefined,
          date: extracted.date,
        });
        setFieldConfidence(extracted.fieldConfidence || {});
        applyExtractedToForm(extracted);
        onReceiptProcessed?.(data.data);
        toast({
          title: "Document Processed!",
          description: "Expense data extracted successfully."
        });
      } else {
        throw new Error('Failed to extract data from document');
      }
    } catch (err) {
      console.error(err);
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

  // 🔄 Preview component for receipts with zoom/rotate
  const ReceiptPreview = ({ filePath, zoom, rotation }: { filePath: string; zoom: number; rotation: number }) => {
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

    const isPdf = filePath.toLowerCase().includes('.pdf') || (signedUrl && signedUrl.toLowerCase().includes('.pdf'));

    return (
      <div className="w-full h-full overflow-auto flex items-center justify-center relative">
        {isPdf ? (
          <div className="w-full h-full" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
            <object data={signedUrl} type="application/pdf" className="w-full h-full" aria-label="PDF preview">
              <p className="p-4 text-center text-sm">
                This browser cannot display the PDF inline.
                <a href={signedUrl} target="_blank" rel="noreferrer" className="underline ml-1">Open the PDF in a new tab</a>.
              </p>
              <iframe src={signedUrl} className="w-full h-full" title="PDF preview" />
            </object>
            <div className="absolute bottom-2 right-2">
              <a href={signedUrl} target="_blank" rel="noreferrer" className="text-xs underline">Open in new tab</a>
            </div>
          </div>
        ) : (
          <img
            src={signedUrl}
            alt="Receipt preview"
            className="max-w-full max-h-full object-contain"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
    );
  };

  // 🔄 Handle file upload event
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZoom(1); setRotation(0);
    setIsUploading(true);
    try {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        throw new Error('Please select an image or PDF file');
      }

      const uploadedFilePath = await uploadFileToSupabase(file);
      setReceiptUrl(uploadedFilePath);
      setLastProcessedBlob(file);

      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been uploaded successfully."
      });

      if (file.type.startsWith('image/')) {
        await processDocumentWithGemini(file);
      } else if (file.type === 'application/pdf') {
        toast({
          title: 'PDF Uploaded',
          description: 'Preview shown below. AI extraction currently supports images only.'
        });
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
      setZoom(1); setRotation(0);

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
        const resp = await fetch(photo.webPath);
        const blob = await resp.blob();
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
        const uploadedFilePath = await uploadFileToSupabase(file);
        setReceiptUrl(uploadedFilePath);
        setLastProcessedBlob(file);
        
        toast({
          title: "Photo Captured",
          description: "Receipt photo captured successfully"
        });

        await processDocumentWithGemini(file);
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
      setZoom(1); setRotation(0);
      
      const photo = await CameraService.pickFromGallery();
      if (photo.webPath) {
        const resp = await fetch(photo.webPath);
        const blob = await resp.blob();
        const file = new File([blob], `gallery-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
        const uploadedFilePath = await uploadFileToSupabase(file);
        setReceiptUrl(uploadedFilePath);
        setLastProcessedBlob(file);
        
        toast({
          title: "Photo Selected",
          description: "Receipt photo selected from gallery"
        });

        await processDocumentWithGemini(file);
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

  // 🔁 Re-run extraction using last file or current receipt URL
  const getCurrentReceiptFile = async (): Promise<File | null> => {
    try {
      if (lastProcessedBlob) {
        return new File([lastProcessedBlob], `reprocess-${Date.now()}`);
      }
      if (!receiptUrl) return null;

      let url = receiptUrl;
      if (!(receiptUrl.startsWith('http') || receiptUrl.startsWith('blob:') || receiptUrl.startsWith('/'))) {
        const { data, error } = await supabase.storage.from('receipts').createSignedUrl(receiptUrl, 60 * 5);
        if (error) throw error;
        url = data?.signedUrl || '';
      }
      if (!url) return null;
      const resp = await fetch(url);
      const blob = await resp.blob();
      const fileName = receiptUrl.split('/').pop() || `receipt-${Date.now()}`;
      return new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
    } catch (e) {
      console.error('Failed to get current receipt file', e);
      return null;
    }
  };

  const handleRerunExtraction = async () => {
    const file = await getCurrentReceiptFile();
    if (!file) {
      toast({ title: 'No File', description: 'Please upload a receipt first.', variant: 'destructive' });
      return;
    }
    await processDocumentWithGemini(file);
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
        <div className="border rounded-md p-3 space-y-4">
          <div className="aspect-[4/3] bg-muted rounded-md overflow-hidden relative">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => setRotation((r) => (r + 90) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={handleRerunExtraction} disabled={isProcessingDocument || isUploading}>
                Re-run Extraction
              </Button>
            </div>
            <ReceiptPreview filePath={receiptUrl} zoom={zoom} rotation={rotation} />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                const dateStr = values.date ? values.date.toISOString().slice(0, 10) : '';
                if (values.date && values.date > new Date()) {
                  toast({ title: 'Future date', description: 'Selected date is in the future. You can still save.' });
                }
                const payload = {
                  vendor: values.vendor.trim(),
                  category: values.category,
                  amount: Number(values.amount),
                  date: dateStr,
                  notes: values.notes || '',
                  receiptUrl: receiptUrl,
                  extractedValues,
                  fieldConfidence,
                };
                onSave?.(payload);
              })}
              className="space-y-4"
            >
              {/* Vendor */}
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Vendor</ShadFormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Walgreens" {...field} />
                    </FormControl>
                    {extractedValues.vendor && (
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary">Auto-filled • {Math.round((fieldConfidence.vendor || 0) * 100)}% confidence</Badge>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Category</ShadFormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {extractedValues.category && (
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary">Auto-filled • {Math.round((fieldConfidence.category || 0) * 100)}% confidence</Badge>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Amount</ShadFormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" inputMode="decimal" placeholder="0.00" {...field} />
                    </FormControl>
                    {extractedValues.amount && (
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary">Auto-filled • {Math.round((fieldConfidence.amount || 0) * 100)}% confidence</Badge>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <ShadFormLabel>Date</ShadFormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              field.value.toLocaleDateString()
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value as Date}
                          onSelect={(d) => d && field.onChange(d)}
                          initialFocus
                          className={cn('p-3 pointer-events-auto')}
                        />
                      </PopoverContent>
                    </Popover>
                    {extractedValues.date && (
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary">Auto-filled • {Math.round((fieldConfidence.date || 0) * 100)}% confidence</Badge>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Notes (optional)</ShadFormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button type="button" variant="destructive" onClick={removeReceipt} className="w-full">
                  Remove Receipt
                </Button>
                <Button type="submit" className="w-full" disabled={!onSave}>
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default ExpenseReceiptUpload;
