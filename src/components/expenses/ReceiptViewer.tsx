import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, Download, X, ChevronLeft, ChevronRight, 
  FileText, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceiptViewerProps {
  receipts: string[];
  trigger?: React.ReactNode;
  className?: string;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipts,
  trigger,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!receipts.length) return null;

  const currentReceipt = receipts[currentIndex];
  const isPdf = currentReceipt?.endsWith('.pdf');

  const nextReceipt = () => {
    setCurrentIndex((prev) => (prev + 1) % receipts.length);
    resetView();
  };

  const prevReceipt = () => {
    setCurrentIndex((prev) => (prev - 1 + receipts.length) % receipts.length);
    resetView();
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const downloadReceipt = () => {
    if (!currentReceipt) return;
    
    const link = document.createElement('a');
    link.href = currentReceipt;
    link.download = `receipt-${currentIndex + 1}.${isPdf ? 'pdf' : 'jpg'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="h-8">
      <Eye className="h-4 w-4 mr-1" />
      View ({receipts.length})
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <span>Receipt Viewer</span>
              <Badge variant="outline">
                {currentIndex + 1} of {receipts.length}
              </Badge>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {receipts.length > 1 && (
                <>
                  <Button size="sm" variant="outline" onClick={prevReceipt}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={nextReceipt}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              {!isPdf && (
                <>
                  <Button size="sm" variant="outline" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {zoom}%
                  </span>
                  <Button size="sm" variant="outline" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={rotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              <Button size="sm" variant="outline" onClick={downloadReceipt}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-auto">
            {isPdf ? (
              <div className="w-full h-full">
                <iframe
                  src={currentReceipt}
                  className="w-full h-full border-0"
                  title={`Receipt ${currentIndex + 1}`}
                />
              </div>
            ) : (
              <div className="relative overflow-auto max-h-full max-w-full">
                <img
                  src={currentReceipt}
                  alt={`Receipt ${currentIndex + 1}`}
                  className="max-w-none transition-transform duration-200 ease-in-out"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                  onError={(e) => {
                    console.error('Error loading image:', e);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {receipts.length > 1 && (
          <>
            <Separator />
            <div className="p-4">
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                {receipts.map((receipt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      resetView();
                    }}
                    className={cn(
                      "aspect-square rounded-md border-2 p-2 hover:bg-gray-50 transition-colors",
                      index === currentIndex 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200"
                    )}
                  >
                    {receipt.endsWith('.pdf') ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                    ) : (
                      <img
                        src={receipt}
                        alt={`Receipt ${index + 1}`}
                        className="h-full w-full object-cover rounded"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;