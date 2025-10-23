/**
 * Supabase Edge Function: gemini-receipt-ocr
 *
 * Using direct Gemini API for receipt OCR
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
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
  const head = b64.slice(0, 32);
  if (head.startsWith("JVBERi0x")) {
    throw new Error("PDF format not supported. The receipt must be converted to an image (JPG/PNG) first.");
  }
  if (head.startsWith("iVBORw0KGgo")) return "image/png";    // PNG
  if (head.startsWith("/9j/")) return "image/jpeg";            // JPEG
  // HEIC detection
  if (head.includes("ftyp") && (head.includes("heic") || head.includes("heix"))) {
    throw new Error("HEIC format not supported. Please convert to JPG or PNG first.");
  }
  return "image/jpeg";
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

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // ISO

  // MM/DD/YY(YY) or MM-DD-YY(YY)
  let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let [, mm, dd, yy] = m;
    let year = Number(yy.length === 2 ? (Number(yy) + 2000) : yy);
    const month = Number(mm);
    const day = Number(dd);
    const d = new Date(year, month - 1, day);
    if (d > today) year -= 1;
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  // DD MMM YYYY or DD MMM YY
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2,4})$/);
  if (m) {
    const [, dStr, monStr, yStr] = m;
    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const idx = months.indexOf(monStr.slice(0,3).toLowerCase());
    if (idx === -1) throw new Error("Unrecognized month in date");
    let year = Number(yStr.length === 2 ? (Number(yStr) + 2000) : yStr);
    const day = Number(dStr);
    const date = new Date(year, idx, day);
    if (date > today) year -= 1;
    return `${year}-${pad2(idx + 1)}-${pad2(day)}`;
  }

  // MMM DD, YYYY
  m = s.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{2,4})$/);
  if (m) {
    const [, monStr, dStr, yStr] = m;
    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const idx = months.indexOf(monStr.slice(0,3).toLowerCase());
    if (idx === -1) throw new Error("Unrecognized month in date");
    let year = Number(yStr.length === 2 ? (Number(yStr) + 2000) : yStr);
    const day = Number(dStr);
    const date = new Date(year, idx, day);
    if (date > today) year -= 1;
    return `${year}-${pad2(idx + 1)}-${pad2(day)}`;
  }

  throw new Error("Unrecognized date format");
}

function safeParseJSONFromText(text: string): any | null {
  if (!text) return null;
  // Try strict parse first
  try { return JSON.parse(text); } catch {}
  // Extract first balanced {...} block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

async function callGemini(
  genAI: GoogleGenerativeAI,
  imageBase64: string,
  mimeType: string,
  modelName: string,
  stricterPrompt = false
): Promise<string> {
  console.log(`Calling Gemini ${modelName} - MIME: ${mimeType}, base64 length: ${imageBase64.length}`);
  
  const systemInstruction = "You extract data from U.S. receipts. Output only valid JSON matching the schema.";

  const allowed = ALLOWED_CATEGORIES.map(c => `"${c}"`).join(", ");
  const userInstruction =
    `Extract ONLY these fields as JSON with this exact schema (no extra fields):
{
  "vendor": string,
  "category": one of [${allowed}],
  "amount": number (total paid, no currency symbol),
  "date": string (ISO YYYY-MM-DD),
  "fieldConfidence": { "vendor": number, "category": number, "amount": number, "date": number }
}
${stricterPrompt ? "Return ONLY valid JSON. No explanations or markdown." : "Return valid JSON only."}`;

  const model = genAI.getGenerativeModel({ 
    model: modelName, 
    systemInstruction 
  });

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
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  const text = result.response?.text?.() ?? "";
  console.log(`Gemini response received, length: ${text.length}`);
  return text;
}

/** Parses payload.imageBase64 supporting raw base64 or data URLs. */
function parseImagePayload(imageBase64: string): { cleanBase64: string; mimeType: string } {
  let base64 = imageBase64.trim();
  let mimeType: string | null = null;

  console.log(`Raw input length: ${base64.length}, first 100 chars: ${base64.substring(0, 100)}`);

  // Data URL?
  const dataUrlMatch = base64.match(/^data:([^;]+);base64,(.*)$/i);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1].toLowerCase();
    base64 = dataUrlMatch[2];
    console.log(`Extracted from data URL - MIME: ${mimeType}, base64 length: ${base64.length}`);
  }

  // Remove ALL whitespace/newlines/carriage returns
  const originalLength = base64.length;
  base64 = base64.replace(/[\s\n\r\t]/g, "");
  if (originalLength !== base64.length) {
    console.log(`Cleaned whitespace: ${originalLength} -> ${base64.length} chars`);
  }

  // Autodetect MIME if data URL didn't specify one
  if (!mimeType) {
    mimeType = detectMimeFromBase64(base64);
    console.log(`Auto-detected MIME type: ${mimeType}`);
  }

  // Normalize MIME type for AI gateway compatibility
  if (mimeType === "image/jpg") mimeType = "image/jpeg";

  // Ensure proper base64 padding
  const paddingNeeded = (4 - (base64.length % 4)) % 4;
  if (paddingNeeded > 0) {
    base64 += '='.repeat(paddingNeeded);
    console.log(`Added ${paddingNeeded} padding characters`);
  }

  console.log(`Final parsed image: ${mimeType}, ${base64.length} chars`);

  return { cleanBase64: base64, mimeType };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const debugMode = url.searchParams.get("debug") === "1";

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check rate limit: 10 requests per minute per IP
    const { data: rateLimitOk, error: rateLimitError } = await supabase
      .rpc("check_rate_limit", {
        p_endpoint: "gemini-receipt-ocr",
        p_identifier: clientIP,
        p_max_requests: 10,
        p_window_minutes: 1
      });
    
    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    } else if (!rateLimitOk) {
      console.warn("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please try again in a moment." 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY not configured");
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

    // Handle data URLs, strip whitespace/newlines, detect MIME reliably
    const { cleanBase64, mimeType } = parseImagePayload(imageBase64);

    // Validate the base64 is well-formed
    if (cleanBase64.length < 100) {
      return new Response(JSON.stringify({ success: false, error: "Image data too short to be valid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if base64 is valid format
    if (!/^[A-Za-z0-9+/]+=*$/.test(cleanBase64)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid base64 format detected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing image: ${mimeType}, ${cleanBase64.length} chars, first 50 chars: ${cleanBase64.substring(0, 50)}`);

    // Optional: guard rail on payload size (~10MB base64 ≈ 7.5MB binary)
    if (cleanBase64.length > 14_000_000) {
      return new Response(JSON.stringify({ success: false, error: "Image too large; please upload a smaller file (< ~10MB base64)" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try with Gemini 2.0 Flash-Lite (faster, cheaper)
    let text: string;
    let rawModelOutput = "";
    try {
      text = await callGemini(genAI, cleanBase64, mimeType, "gemini-2.0-flash-lite", false);
      rawModelOutput = text;
    } catch (e) {
      console.error("Gemini flash-lite error:", e);
      // Fallback to Gemini 2.0 Flash (more capable)
      try {
        console.log("Retrying with gemini-2.0-flash...");
        text = await callGemini(genAI, cleanBase64, mimeType, "gemini-2.0-flash", false);
        rawModelOutput = text;
      } catch (e2) {
        console.error("Gemini flash error:", e2);
        return new Response(JSON.stringify({ success: false, error: "Gemini API request failed" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    let json = safeParseJSONFromText(text);

    // Retry once with stricter prompt if parsing failed
    if (!json) {
      try {
        console.log("JSON parse failed, retrying with stricter prompt...");
        const retryText = await callGemini(genAI, cleanBase64, mimeType, "gemini-2.0-flash-lite", true);
        json = safeParseJSONFromText(retryText);
        rawModelOutput = retryText;
      } catch (e) {
        console.error("Gemini retry error:", e);
      }
    }

    if (!json) {
      const errorResponse: any = { 
        success: false, 
        error: "Failed to parse JSON from model output" 
      };
      if (debugMode) errorResponse.rawModel = rawModelOutput;
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the parsed JSON to debug
    console.log("Parsed JSON from Gemini:", JSON.stringify(json));
    
    // Handle if Gemini returns an array (multi-item receipt)
    if (Array.isArray(json)) {
      console.log(`Gemini returned array with ${json.length} items, using first item`);
      json = json[0]; // Use the first item
    }

    // Post-processing & validation
    const vendor: string = typeof json.vendor === "string" ? json.vendor.trim() : (json.vendor ?? "");

    // Category validation/normalization
    let category: AllowedCategory;
    if (typeof json.category === "string" && (ALLOWED_CATEGORIES as readonly string[]).includes(json.category)) {
      category = json.category as AllowedCategory;
    } else {
      category = normalizeCategory(vendor, typeof json.category === "string" ? json.category : undefined);
    }

    // Amount coercion
    const amountStr = String(json.amount ?? "").trim();
    const amountNum =
      typeof json.amount === "number"
        ? json.amount
        : Number(amountStr.replace(/[^0-9.\-]/g, ""));
    if (!Number.isFinite(amountNum)) {
      return new Response(JSON.stringify({ success: false, error: "Model returned invalid amount" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Date normalization - use today's date if missing or invalid
    let isoDate: string;
    try {
      if (!json.date || json.date === null || String(json.date).trim() === "") {
        console.log("Date field missing or empty, using today's date");
        const today = new Date();
        isoDate = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
      } else {
        isoDate = normalizeDate(json.date);
      }
    } catch (e) {
      console.log(`Date parsing failed for value "${json.date}", using today's date. Error: ${e instanceof Error ? e.message : String(e)}`);
      const today = new Date();
      isoDate = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
    }

    // Field confidences (default 0.6 and clamp)
    const fc = json.fieldConfidence ?? {};
    const fieldConfidence = {
      vendor: clamp01(fc.vendor, 0.6),
      category: clamp01(fc.category, 0.6),
      amount: clamp01(fc.amount, 0.6),
      date: clamp01(fc.date, 0.6),
    };

    // Final response
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
