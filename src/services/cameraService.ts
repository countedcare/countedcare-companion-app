
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export class CameraService {
  static async takePicture(): Promise<Photo> {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    return image;
  }

  static async pickFromGallery(): Promise<Photo> {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    return image;
  }

  static async saveImageToDevice(photo: Photo, fileName: string): Promise<string> {
    if (!photo.webPath) {
      throw new Error('No image path available');
    }

    // Read the photo as base64
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    const base64Data = await this.convertBlobToBase64(blob);

    // Save to filesystem
    const savedFile = await Filesystem.writeFile({
      path: `receipts/${fileName}.jpg`,
      data: base64Data,
      directory: Directory.Documents,
    });

    return savedFile.uri;
  }

  private static convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.readAsDataURL(blob);
    });
  }

  static async requestPermissions() {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    }
    return true; // Web doesn't need explicit permissions
  }
}
