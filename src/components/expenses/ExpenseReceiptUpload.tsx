import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Scan, FileText, Loader2, RotateCw, ZoomIn, ZoomOut, Calendar as CalendarIcon, MapPin } from 'lucide-react';
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
import * as pdfjsLib from 'pdfjs-dist';

interface ExpenseReceiptUploadProps {
  receiptUrl: string | undefined;
  setReceiptUrl: (url: string | undefined) => void;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
  isProcessingDocument: boolean;
  setIsProcessingDocument: (loading: boolean) => void;
  onReceiptProcessed?: (data: any) => void;
  onSave?: (expenseData: {
    title: string;
    vendor: string;
    location?: string;
    category: string;
    amount: number;
    date: string;
    notes?: string;
    receiptUrl?: string;
    extractedValues: { title?: string; vendor?: string; location?: string; category?: string; amount?: number; date?: string };
    fieldConfidence: Record<string, number>;
  }) => void;
  initialValues?: {
    title?: string;
    vendor?: string;
    location?: string;
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

  // ----- Form schema -----
  const FormSchema = z.object({
    title: z.string().min(1, 'Expense title is required'),
    vendor: z.string().min(1, 'Vendor is required'),
    location: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be greater than 0')),
    date: z.date(),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      vendor: '',
      location: '',
      category: '',
      amount: undefined as unknown as number,
      date: new Date(),
      notes: '',
    },
  });

  // Apply initial values if provided
  useEffect(() => {
    if (!initialValues) return;
    if (initialValues.title) form.setValue('title', initialValues.title);
    if (initialValues.vendor) form.setValue('vendor', initialValues.vendor);
    if (initialValues.location) form.setValue('location', initialValues.location);
    if (initialValues.category) form.setValue('category', initialValues.category);
    if (typeof initialValues.amount === 'number') form.setValue('amount', initialValues.amount);
    if (initialValues.date) form.setValue('date', new Date(initialValues.date));
    if (initialValues.notes) form.setValue('notes', initialValues.notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialValues?.title,
    initialValues?.vendor,
    initialValues?.location,
    initialValues?.category,
    initialValues?.amount,
    initialValues?.date,
    initialValues?.notes,
  ]);

  // ----- Extraction results -----
  const [extractedValues, setExtractedValues] = useState<{
    title?: string;
    vendor?: string;
    location?: string;
    category?: string;
    amount?: number;
    date?: string;
  }>({});
  const [fieldConfidence, setFieldConfidence] = useState<Record<string, number>>({});

  // ----- Preview controls -----
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Keep last uploaded/captured file for re-run extraction
  const [lastProcessedBlob, setLastProcessedBlob] = useState<Blob | null>(null);

  const applyExtractedToForm = (data: any) => {
    if (data.title) form.setValue('title', data.title);
    if (!data.title) {
      // derive a reasonable default
      const d = data.date ? new Date(data.date) : undefined;
      const dateStr = d ? d.toLocaleDateString() : '';
      if (data.vendor || dateStr) form.setValue('title', [data.vendor, dateStr].filter(Boolean).join(' — '));
    }
    if (data.vendor) form.setValue('vendor', data.vendor);
    if (data.location) form.setValue('location', data.location);
    if (data.category) form.setValue('category', data.category);
    if (data.amount) form.setValue('amount', Number(data.amount));
    if (data.date) form.setValue('date', new Date(data.date));
  };

  // Base64 util
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Render first page of a PDF to a JPEG file (for OCR)
  const pdfFirstPageToImageFile = async (pdfArrayBuffer: ArrayBuffer): Promise<File> => {
    // Ensure workerSrc configured
    // @ts-ignore
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    }
    // @ts-ignore
    const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 }); // good quality for OCR

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), 'image/jpeg', 0.92));
    return new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
  };

  // ----- OCR with Gemini -----
  const processDocumentWithGemini = async (file: File) => {
    try {
      setIsProcessingDocument(true);
      toast({ title: 'Processing', description: 'Extracting expense data...' });

      const base64Data = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke('gemini-receipt-ocr', {
        body: { imageBase64: base64Data, wantFields: ['title', 'amount', 'date', 'vendor', 'location', 'category'] },
      });
      if (error) throw new Error(error.message || 'Failed to process document');

      if (data?.success && data?.data) {
        const ex = data.data || {};
        const normalized = {
          title: ex.title || undefined,
          vendor: ex.vendor || undefined,
          location: ex.location || undefined,
          category: ex.category || undefined,
          amount: ex.amount != null ? Number(ex.amount) : undefined,
          date: ex.date || undefined,
        };
        setExtractedValues(normalized);
        setFieldConfidence(ex.fieldConfidence || {});
        applyExtractedToForm(normalized);
        onReceiptProcessed?.(ex);
        toast({ title: 'Done', description: 'Data extracted successfully.' });
      } else {
        throw new Error('Failed to extract data from document');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Could not extract data. You can still enter it manually.';
      toast({
        title: 'Processing Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessingDocument(false);
    }
  };

  // ----- Upload to Supabase -----
  const uploadFileToSupabase = async (file: File) => {
    const filePath = `receipts/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, file);
    if (uploadError) throw new Error(uploadError.message);
    return filePath;
  };

  // ----- Preview (image + pdf.js canvas) -----
  const ReceiptPreview = ({ filePath, zoom, rotation }: { filePath: string; zoom: number; rotation: number }) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const getSignedUrl = async () => {
        setIsLoading(true);
        if (filePath.startsWith('http') || filePath.startsWith('blob:') || filePath.startsWith('/')) {
          setSignedUrl(filePath);
          setIsLoading(false);
          return;
        }
        const { data, error } = await supabase.storage.from('receipts').createSignedUrl(filePath, 60 * 60);
        if (error) {
          console.error('Signed URL error:', error.message);
          setSignedUrl(null);
        } else {
          setSignedUrl(data?.signedUrl || null);
        }
        setIsLoading(false);
      };
      if (filePath) getSignedUrl();
    }, [filePath]);

    const isPdf = filePath.toLowerCase().includes('.pdf') || (signedUrl && signedUrl.toLowerCase().includes('.pdf'));

    // Render PDF page 1 into canvas, fit to container width, support zoom/rotation
    useEffect(() => {
      const renderPdf = async () => {
        if (!isPdf || !signedUrl || !canvasRef.current || !containerRef.current) return;

        // @ts-ignore
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          // @ts-ignore
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
        }
        try {
          const resp = await fetch(signedUrl, { cache: 'no-store' });
          const buf = await resp.arrayBuffer();
          // @ts-ignore
          const loadingTask = pdfjsLib.getDocument({ data: buf });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);

          const viewportBase = page.getViewport({ scale: 1, rotation });
          const containerWidth = containerRef.current.clientWidth || 600;
          const scale = Math.max(0.5, Math.min(3, (containerWidth / viewportBase.width) * zoom));
          const viewport = page.getViewport({ scale, rotation });

          const canvas = canvasRef.current;
          const ctx = canvas!.getContext('2d')!;
          canvas!.width = viewport.width;
          canvas!.height = viewport.height;
          ctx.clearRect(0, 0, canvas!.width, canvas!.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
        } catch (e) {
          console.error('PDF render failed', e);
        }
      };
      renderPdf();
    }, [isPdf, signedUrl, zoom, rotation]);

    if (isLoading) {
      return (
        <div className="w-full h-80 sm:h-96 flex items-center justify-center bg-muted rounded">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (!signedUrl) {
      return (
        <div className="w-full h-80 sm:h-96 flex items-center justify-center bg-muted text-muted-foreground rounded">
          Failed to load preview
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full h-80 sm:h-96 overflow-auto flex items-center justify-center bg-background rounded relative">
        {isPdf ? (
          <canvas ref={canvasRef} className="max-w-full max-h-full" aria-label="PDF preview" />
        ) : (
          <img
            src={signedUrl}
            alt="Receipt preview"
            className="max-w-full max-h-full object-contain"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}
          />
        )}
        {isPdf && (
          <a href={signedUrl} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 text-xs underline">
            open pdf
          </a>
        )}
      </div>
    );
  };

  // ----- Upload handlers -----
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

      // Keep original for re-run
      setLastProcessedBlob(file);

      toast({ title: 'Receipt uploaded', description: 'Preview below.' });

      // Extraction for images and PDFs (PDF -> image first)
      if (file.type === 'application/pdf') {
        const buf = await file.arrayBuffer();
        const imageFromPdf = await pdfFirstPageToImageFile(buf);
        await processDocumentWithGemini(imageFromPdf);
      } else {
        await processDocumentWithGemini(file);
      }
    } catch (error) {
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'There was an issue uploading your receipt.',
        variant: 'destructive',
      });
      setReceiptUrl(undefined);
    } finally {
      setIsUploading(false);
      // reset input so same file can be selected again
      e.currentTarget.value = '';
    }
  };

  const handleCameraCapture = async () => {
    try {
      setIsUploading(true);
      setZoom(1); setRotation(0);

      const hasPermission = await CameraService.requestPermissions();
      if (!hasPermission) {
        toast({ title: 'Permission Required', description: 'Camera permission is needed', variant: 'destructive' });
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

        toast({ title: 'Photo captured', description: 'Preview below.' });
        await processDocumentWithGemini(file);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({ title: 'Camera Error', description: 'Failed to capture photo.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

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

        toast({ title: 'Photo selected', description: 'Preview below.' });
        await processDocumentWithGemini(file);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      toast({ title: 'Gallery Error', description: 'Failed to select photo.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  // Re-run extraction
  const getCurrentReceiptFile = async (): Promise<File | null> => {
    try {
      if (lastProcessedBlob) return new File([lastProcessedBlob], `reprocess-${Date.now()}`);
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

      if (blob.type === 'application/pdf') {
        const buf = await blob.arrayBuffer();
        return await pdfFirstPageToImageFile(buf);
      }

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

  const removeReceipt = () => {
    setReceiptUrl(undefined);
    toast({ title: 'Receipt Removed', description: 'It has been removed from this expense.' });
  };

  // ----- UI -----
  return (
    <div className="space-y-2">
      <Label>Receipt & Document Upload</Label>
      
      {/* IRS Receipt Warning */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800">
              Receipt Required for IRS Documentation
            </p>
            <p className="text-xs text-amber-700">
              Keep receipts for all medical and tax-deductible expenses. The IRS may request proof during an audit. 
              Without proper documentation, deductions may be disallowed.
            </p>
          </div>
        </div>
      </div>

      {!receiptUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center space-y-4">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium mb-2">Add Receipt or Document</h3>
              <p className="text-sm text-gray-600 mb-1">Upload receipts, invoices, or expense documents</p>
              <p className="text-xs text-gray-500 mb-4">AI will automatically extract expense details</p>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={handleCameraCapture} disabled={isUploading || isProcessingDocument} className="w-full">
                  <Scan className="mr-2 h-4 w-4" />
                  Camera
                </Button>
                <Button type="button" variant="outline" onClick={handleGalleryPick} disabled={isUploading || isProcessingDocument} className="w-full">
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
                  <Button type="button" variant="outline" className="w-full cursor-pointer" asChild disabled={isUploading || isProcessingDocument}>
                    <div>
                      {isProcessingDocument ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      {isProcessingDocument ? 'Processing...' : 'Upload File'}
                    </div>
                  </Button>
                </label>
              </div>

              <Button type="button" variant="outline" onClick={handleCameraCapture} disabled={isUploading || isProcessingDocument} className="w-full">
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
          <div className="bg-muted rounded-md overflow-hidden relative">
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
                  title: values.title.trim(),
                  vendor: values.vendor.trim(),
                  location: values.location?.trim() || '',
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
              {/* Expense Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Expense Title</ShadFormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Walgreens prescription" {...field} />
                    </FormControl>
                    {extractedValues.title && (
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary">Auto-filled • {Math.round((fieldConfidence.title || 0) * 100)}% confidence</Badge>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Location</ShadFormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Los Angeles, CA" {...field} />
                    </FormControl>
                    {extractedValues.location && (
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary">Auto-filled • {Math.round((fieldConfidence.location || 0) * 100)}% confidence</Badge>
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
                    {extractedValues.amount != null && (
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
                            className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? field.value.toLocaleDateString() : <span>Pick a date</span>}
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

