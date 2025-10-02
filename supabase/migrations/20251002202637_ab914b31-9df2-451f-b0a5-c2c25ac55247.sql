-- Make receipts bucket public so receipt URLs work properly
UPDATE storage.buckets 
SET public = true 
WHERE id = 'receipts';