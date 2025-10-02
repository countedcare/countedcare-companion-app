# Receipt OCR – Local Dev

## Option A: Direct function serve (recommended for one function)
```bash
supabase functions serve gemini-receipt-ocr --env-file ./supabase/functions/.env --no-verify-jwt
```
- Endpoint: http://127.0.0.1:9999
- In `src/lib/ocrClient.ts` set: `USE_LOCAL_GATEWAY = false`

## Option B: Full local stack gateway
```bash
supabase start
```
- Endpoint: http://127.0.0.1:54321/functions/v1/gemini-receipt-ocr
- In `src/lib/ocrClient.ts` set: `USE_LOCAL_GATEWAY = true`

## Production
```
https://<PROJECT_REF>.functions.supabase.co/gemini-receipt-ocr
```
(Requires VITE_SUPABASE_ANON_KEY headers)

## Environment Setup

Make sure you have a `.env` file in `supabase/functions/` with:
```
GEMINI_API_KEY=your_api_key_here
```

## Verification & Testing

### Quick connectivity test (tiny 1x1 PNG):
```bash
curl -X POST http://127.0.0.1:9999?debug=1 \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

### Environment-specific curl examples

Replace `/9j/4AAQ...` with your actual base64-encoded receipt image.

#### Local 9999 (Direct function serve)
```bash
curl -X POST "http://127.0.0.1:9999?debug=1" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"data:image/jpeg;base64,/9j/4AAQ..."}'
```

#### Local 54321 (Full local stack gateway)
```bash
curl -X POST "http://127.0.0.1:54321/functions/v1/gemini-receipt-ocr?debug=1" \
  -H "Content-Type: application/json" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -d '{"imageBase64":"data:image/jpeg;base64,/9j/4AAQ..."}'
```

#### Production
```bash
curl -X POST "https://<PROJECT_REF>.functions.supabase.co/gemini-receipt-ocr?debug=1" \
  -H "Content-Type: application/json" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -d '{"imageBase64":"data:image/jpeg;base64,/9j/4AAQ..."}'
```

### Expected responses

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "vendor": "Walmart",
    "category": "Medical Equipment & Supplies",
    "amount": 42.99,
    "date": "2025-01-15",
    "fieldConfidence": {
      "vendor": 0.95,
      "category": 0.85,
      "amount": 0.98,
      "date": 0.92
    }
  }
}
```

**Error (400/500)**:
```json
{
  "success": false,
  "error": "Failed to parse JSON from model output"
}
```

The app will now show detailed error messages with HTTP status codes and server messages instead of generic "non-2xx" errors.
