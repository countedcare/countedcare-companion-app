const FN_URL = "https://beekrnfusoksullylvld.supabase.co/functions/v1/gemini-receipt-ocr?debug=1";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_ANON_KEY) {
  console.warn("Missing VITE_SUPABASE_ANON_KEY in env.");
}

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
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ imageBase64 }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  if (!res.ok || !json?.success) {
    const serverMsg = json?.error ?? text ?? res.statusText;
    throw new Error(`HTTP ${res.status}: ${serverMsg}`);
  }

  return json.data as {
    vendor: string;
    category: string;
    amount: number;
    date: string;
    fieldConfidence: any;
  };
}
