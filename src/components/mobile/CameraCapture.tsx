
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, ImageIcon, Upload } from 'lucide-react';
import { CameraService } from '@/services/cameraService';
import { useToast } from '@/components/ui/use-toast';
import { Photo } from '@capacitor/camera';

interface CameraCaptureProps {
  onImageCaptured: (imageUri: string, photo: Photo) => void;
  disabled?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTakePicture = async () => {
    try {
      setLoading(true);
      
      // Request permissions
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

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">Capture Receipt</h3>
          <p className="text-sm text-muted-foreground">
            Take a photo or select from gallery
          </p>
        </div>

        {capturedImage && (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured receipt" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setCapturedImage(null)}
            >
              Remove
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleTakePicture}
            disabled={loading || disabled}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {loading ? 'Taking...' : 'Camera'}
          </Button>
          
          <Button
            onClick={handlePickFromGallery}
            disabled={loading || disabled}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Gallery
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CameraCapture;
