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

## Verification

Test the endpoint is working:
```bash
curl -X POST http://127.0.0.1:9999?debug=1 \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

The app will now show detailed error messages with HTTP status codes and server messages instead of generic "non-2xx" errors.
