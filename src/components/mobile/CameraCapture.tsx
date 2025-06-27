
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, ImageIcon, Scan, Loader2 } from 'lucide-react';
import { CameraService } from '@/services/cameraService';
import { useToast } from '@/components/ui/use-toast';
import { Photo } from '@capacitor/camera';
import { supabase } from '@/integrations/supabase/client';

interface CameraCaptureProps {
  onImageCaptured: (imageUri: string, photo: Photo) => void;
  onReceiptProcessed?: (extractedData: any) => void;
  disabled?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onImageCaptured, 
  onReceiptProcessed,
  disabled 
}) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data:image/jpeg;base64, prefix
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const processReceiptWithGemini = async (imageUri: string) => {
    try {
      setProcessing(true);
      
      toast({
        title: "Processing Receipt",
        description: "Extracting expense data from your receipt..."
      });

      const base64Image = await convertImageToBase64(imageUri);
      
      const { data, error } = await supabase.functions.invoke('gemini-receipt-ocr', {
        body: { imageBase64: base64Image }
      });

      if (error) {
        console.error('OCR processing error:', error);
        throw new Error(error.message || 'Failed to process receipt');
      }

      if (data?.success && data?.data) {
        toast({
          title: "Receipt Processed!",
          description: "Expense data extracted successfully"
        });
        
        if (onReceiptProcessed) {
          onReceiptProcessed(data.data);
        }
      } else {
        throw new Error('Failed to extract data from receipt');
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast({
        title: "Processing Error",
        description: "Could not extract data from receipt. You can still add the expense manually.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleTakePicture = async () => {
    try {
      setLoading(true);
      
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
        setCapturedImage(photo.webPath);
        onImageCaptured(photo.webPath, photo);
        
        toast({
          title: "Photo Captured",
          description: "Receipt photo captured successfully"
        });

        // Auto-process with Gemini
        await processReceiptWithGemini(photo.webPath);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast({
        title: "Camera Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setLoading(true);
      
      const photo = await CameraService.pickFromGallery();
      if (photo.webPath) {
        setCapturedImage(photo.webPath);
        onImageCaptured(photo.webPath, photo);
        
        toast({
          title: "Photo Selected",
          description: "Receipt photo selected from gallery"
        });

        // Auto-process with Gemini
        await processReceiptWithGemini(photo.webPath);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      toast({
        title: "Gallery Error",
        description: "Failed to select photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualProcess = async () => {
    if (capturedImage) {
      await processReceiptWithGemini(capturedImage);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">Capture Receipt</h3>
          <p className="text-sm text-muted-foreground">
            Take a photo and AI will extract expense details
          </p>
        </div>

        {capturedImage && (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured receipt" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {!processing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualProcess}
                  disabled={processing}
                >
                  <Scan className="h-4 w-4 mr-1" />
                  Process
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCapturedImage(null)}
                disabled={processing}
              >
                Remove
              </Button>
            </div>
            
            {processing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Processing receipt...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleTakePicture}
            disabled={loading || processing || disabled}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {loading ? 'Taking...' : 'Camera'}
          </Button>
          
          <Button
            onClick={handlePickFromGallery}
            disabled={loading || processing || disabled}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            Gallery
          </Button>
        </div>

        {processing && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-700">
              AI is reading your receipt and extracting expense details...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CameraCapture;
