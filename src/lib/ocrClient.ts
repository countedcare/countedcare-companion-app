import { supabase } from "@/integrations/supabase/client";

export async function fileToDataUrl(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error("File too large (>10MB).");
  const base64 = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
  if (!/^data:.*;base64,/.test(base64)) throw new Error("Not a base64 data URL.");
  return base64;
}

export async function runReceiptOcr(imageBase64: string) {
  const { data, error } = await supabase.functions.invoke('gemini-receipt-ocr', {
    body: { imageBase64 },
  });

  if (error) {
    throw new Error(error.message || 'OCR processing failed');
  }

  if (!data?.success) {
    const msg = data?.error || 'Unknown OCR error';
    if (data?.rawModel) console.warn("Gemini rawModel:", data.rawModel);
    throw new Error(msg);
  }

  return data.data as {
    vendor: string;
    category: string;
    amount: number;
    date: string;
    fieldConfidence: any;
  };
}
