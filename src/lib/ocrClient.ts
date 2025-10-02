const PROJECT_REF = "beekrnfusoksullylvld";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Set this to true if you use `supabase start` (gateway on 54321) in dev.
// Set to false if you use `supabase functions serve` (function on 9999).
const USE_LOCAL_GATEWAY = false;

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const FN_URL = isLocal
  ? (USE_LOCAL_GATEWAY
      ? "http://127.0.0.1:54321/functions/v1/gemini-receipt-ocr?debug=1"
      : "http://127.0.0.1:9999?debug=1")
  : `https://${PROJECT_REF}.functions.supabase.co/gemini-receipt-ocr?debug=1`;

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
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // Gateway/prod require auth headers; direct 9999 doesn't, but harmless to include.
  if (FN_URL.includes("functions.supabase.co") || FN_URL.includes("54321")) {
    headers.apikey = ANON_KEY;
    headers.Authorization = `Bearer ${ANON_KEY}`;
  }

  console.log("Calling OCR function:", FN_URL);
  const res = await fetch(FN_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageBase64 }),
  });

  const bodyText = await res.text();
  console.log("OCR response status:", res.status, "body length:", bodyText.length);
  
  let bodyJson: any = null;
  try { bodyJson = JSON.parse(bodyText); } catch {}

  if (!res.ok || !bodyJson?.success) {
    const msg = bodyJson?.error ?? bodyText ?? res.statusText;
    console.error("OCR error response:", { status: res.status, bodyJson, bodyText });
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }

  console.log("OCR success:", bodyJson);

  return bodyJson.data as {
    vendor: string;
    category: string;
    amount: number;
    date: string;
    fieldConfidence: { vendor: number; category: number; amount: number; date: number };
  };
}
