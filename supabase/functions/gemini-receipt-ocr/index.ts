/**
 * Supabase Edge Function: gemini-receipt-ocr
 * 
 * Description:
 *  - Accepts a base64-encoded receipt image (JPG/PNG)
 *  - Extracts vendor, amount, date, and category using Google Gemini
 *  - Enforces strict JSON output (retries once if parsing fails)
 *  - Normalizes and validates fields, returning confidences per field
 *
 * CURL example:
 *  curl -X POST \
 *    -H "Content-Type: application/json" \
 *    -H "apikey: $SUPABASE_ANON_KEY" \
 *    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
 *    -d '{"imageBase64":"/9j/4AAQSkZJRgABAQAAAQABAAD..."}' \
 *    https://YOUR-PROJECT-REF.functions.supabase.co/gemini-receipt-ocr
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Allowed categories (must match EXACT strings)
const ALLOWED_CATEGORIES = [
  "Therapy & Counseling",
  "Psychologist/Psychiatrist",
  "Transportation to Care",
  "Medical Equipment & Supplies",
  "Prescriptions & Medications",
  "Doctor & Hospital Visits",
  "Home Health & Personal Care",
  "Dental & Vision",
  "Facility & Long-Term Care",
  "Home Modifications",
  "Insurance Premiums",
  "Other Qualified Medical",
] as const;

type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

function detectMimeFromBase64(b64: string): string {
  // Detect common signatures
  const head = b64.slice(0, 16);
  if (head.startsWith("JVBERi0x")) return "application/pdf"; // PDF (%PDF)
  if (head.startsWith("iVBORw0KGgo")) return "image/png";    // PNG
  if (head.startsWith("/9j/")) return "image/jpeg";            // JPEG
  return "image/jpeg"; // default fallback to image
}

function clamp01(n: unknown, fallback = 0.6): number {
  const v = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(v)) return fallback;
  return Math.min(1, Math.max(0, v));
}

function normalizeCategory(vendor: string | undefined, rawCategory: string | undefined): AllowedCategory {
  const lcVendor = (vendor ?? "").toLowerCase();
  const lcCat = (rawCategory ?? "").toLowerCase();
  const hay = `${lcVendor} ${lcCat}`;

  const map: Array<{ re: RegExp; cat: AllowedCategory }> = [
    { re: /(uber|lyft|taxi|ride|bus|train|gas|mileage)/, cat: "Transportation to Care" },
    { re: /(therapy|counsel|mental)/, cat: "Therapy & Counseling" },
    { re: /(psycholog|psychiat)/, cat: "Psychologist/Psychiatrist" },
    { re: /(\brx\b|pharmacy|walgreens|cvs|rite\s*aid)/, cat: "Prescriptions & Medications" },
    { re: /(hospital|clinic|urgent|visit|copay)/, cat: "Doctor & Hospital Visits" },
    { re: /(wheelchair|incontinence|supplies|walker|cane|monitor)/, cat: "Medical Equipment & Supplies" },
    { re: /(home\s*health|aide|caregiver|personal\s*care)/, cat: "Home Health & Personal Care" },
    { re: /(dental|vision|optometry|glasses)/, cat: "Dental & Vision" },
    { re: /(nursing\s*home|assisted\s*living|long-?term)/, cat: "Facility & Long-Term Care" },
    { re: /(ramp|grab\s*bar|home\s*modification)/, cat: "Home Modifications" },
    { re: /(insurance\s*premium|cobra|medicare\s*part)/, cat: "Insurance Premiums" },
  ];
  for (const m of map) if (m.re.test(hay)) return m.cat;
  return "Other Qualified Medical";
}

function pad2(n: number) { return n.toString().padStart(2, "0"); }

function normalizeDate(raw: unknown): string {
  if (!raw) throw new Error("Missing date");
  const s = String(raw).trim();
  const today = new Date();

  // Already ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // MM/DD/YY(YY) or MM-DD-YY(YY)
  let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let [_, mm, dd, yy] = m;
    let year = Number(yy.length === 2 ? (Number(yy) + 2000) : yy);
    const month = Number(mm);
    const day = Number(dd);
    // If resulting date is in the future, move to previous year
    const d = new Date(year, month - 1, day);
    if (d > today) year -= 1;
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  // DD MMM YYYY or DD MMM YY (e.g., 05 Aug 2025)
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2,4})$/);
  if (m) {
    const [_, dStr, monStr, yStr] = m;
    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const idx = months.indexOf(monStr.slice(0,3).toLowerCase());
    if (idx === -1) throw new Error("Unrecognized month in date");
    let year = Number(yStr.length === 2 ? (Number(yStr) + 2000) : yStr);
    const day = Number(dStr);
    const date = new Date(year, idx, day);
    if (date > today) year -= 1;
    return `${year}-${pad2(idx + 1)}-${pad2(day)}`;
  }

  // Fallback attempt: MMM DD, YYYY
  m = s.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{2,4})$/);
  if (m) {
    const [_, monStr, dStr, yStr] = m;
    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const idx = months.indexOf(monStr.slice(0,3).toLowerCase());
    if (idx === -1) throw new Error("Unrecognized month in date");
    let year = Number(yStr.length === 2 ? (Number(yStr) + 2000) : yStr);
    const day = Number(dStr);
    const date = new Date(year, idx, day);
    if (date > new Date()) year -= 1;
    return `${year}-${pad2(idx + 1)}-${pad2(day)}`;
  }

  throw new Error("Unrecognized date format");
}

function safeParseJSONFromText(text: string): any | null {
  // Try direct parse
  try { return JSON.parse(text); } catch {}
  // Try to extract the first {...} block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

async function callGeminiOnce(genAI: GoogleGenerativeAI, imageBase64: string, mimeType: string, strongerJsonOnly = false) {
  const systemInstruction = "You extract data from U.S. receipts. Output only valid JSON matching the schema.";

  const allowed = ALLOWED_CATEGORIES.map(c => `\"${c}\"`).join(", ");

  const userInstruction = `Extract ONLY these fields as JSON with this exact schema (no extra fields):\n{\n  \"vendor\": string,\n  \"category\": one of [${allowed}],\n  \"amount\": number (total paid, no currency symbol),\n  \"date\": string (ISO YYYY-MM-DD),\n  \"fieldConfidence\": { \"vendor\": number, \"category\": number, \"amount\": number, \"date\": number }\n}\n${strongerJsonOnly ? "Return ONLY valid JSON. No explanations or markdown." : "Return valid JSON only."}`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", systemInstruction });
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: userInstruction },
          { inlineData: { data: imageBase64, mimeType } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  });

  const text = result.response?.text?.() ?? "";
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey =
      Deno.env.get("GOOGLE_API_KEY") ||
      Deno.env.get("GEMINI_API_KEY") ||
      Deno.env.get("GEMINI_API");
    if (!apiKey) {
      console.error("Gemini OCR: Missing API key. Expected one of GOOGLE_API_KEY, GEMINI_API_KEY, GEMINI_API");
      return new Response(JSON.stringify({ success: false, error: "Gemini API key not configured on the server" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: any = null;
    try {
      payload = await req.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageBase64 = payload?.imageBase64;
    if (!imageBase64 || typeof imageBase64 !== "string" || imageBase64.length < 10) {
      return new Response(JSON.stringify({ success: false, error: "Missing or invalid imageBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mimeType = detectMimeFromBase64(imageBase64);
    // Gemini supports PDF, PNG, JPEG processing

    const genAI = new GoogleGenerativeAI(apiKey);

    // First attempt
    let text: string;
    try {
      text = await callGeminiOnce(genAI, imageBase64, mimeType, false);
    } catch (e) {
      console.error("Gemini API error (first attempt):", e);
      throw new Error("Gemini API request failed");
    }

    let json = safeParseJSONFromText(text);

    // Retry once with stronger constraint if parsing failed
    if (!json) {
      try {
        const retryText = await callGeminiOnce(genAI, imageBase64, mimeType, true);
        json = safeParseJSONFromText(retryText);
      } catch (e) {
        console.error("Gemini API error (retry):", e);
      }
    }

    if (!json) {
      return new Response(JSON.stringify({ success: false, error: "Failed to parse JSON from model output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Post-processing & validation
    const vendor: string = typeof json.vendor === "string" ? json.vendor.trim() : (json.vendor ?? "");

    // Category validation/normalization
    let category: AllowedCategory;
    if (typeof json.category === "string" && ALLOWED_CATEGORIES.includes(json.category as AllowedCategory)) {
      category = json.category as AllowedCategory;
    } else {
      category = normalizeCategory(vendor, typeof json.category === "string" ? json.category : undefined);
    }

    // Amount coercion
    const amountNum = typeof json.amount === "number" ? json.amount : Number(String(json.amount ?? "").replace(/[^0-9.\-]/g, ""));
    if (Number.isNaN(amountNum)) {
      return new Response(JSON.stringify({ success: false, error: "Model returned invalid amount" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Date normalization
    let isoDate: string;
    try {
      isoDate = normalizeDate(json.date);
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: `Invalid date: ${e instanceof Error ? e.message : String(e)}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Field confidences (default 0.6 and clamp)
    const fc = json.fieldConfidence ?? {};
    const fieldConfidence = {
      vendor: clamp01(fc.vendor, 0.6),
      category: clamp01(fc.category, 0.6),
      amount: clamp01(fc.amount, 0.6),
      date: clamp01(fc.date, 0.6),
    };

    const responseBody = {
      success: true,
      data: {
        vendor,
        category,
        amount: Number(amountNum),
        date: isoDate,
        fieldConfidence,
      },
    } as const;

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in gemini-receipt-ocr:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
