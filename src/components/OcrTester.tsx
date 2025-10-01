import { useState } from "react";
import { fileToDataUrl, runReceiptOcr } from "@/lib/ocrClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";

export default function OcrTester() {
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    setOut(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await runReceiptOcr(dataUrl);
      setOut(result);
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Receipt OCR Tester</CardTitle>
        <CardDescription>
          Upload a receipt image to test the OCR extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" disabled={loading}>
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={onChange}
                className="hidden"
              />
            </label>
          </Button>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          )}
        </div>

        {err && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>OCR Processing Failed:</strong> {err}
            </AlertDescription>
          </Alert>
        )}

        {out && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Extracted Data:</h3>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(out, null, 2)}
            </pre>
          </div>
        )}

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use clear JPEG/PNG images for best results</li>
              <li>PDFs should be 1 page only</li>
              <li>iPhone HEIC format not supported—convert to JPG/PNG first</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
