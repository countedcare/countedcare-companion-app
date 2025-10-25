import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to generate signed URLs for private receipt files
 * @param receiptPath - The storage path to the receipt file
 * @param expiresIn - Expiry time in seconds (default: 1 hour)
 * @returns Object with signedUrl, loading state, and error
 */
export function useSignedReceiptUrl(receiptPath: string | null | undefined, expiresIn: number = 3600) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!receiptPath) {
      setSignedUrl(null);
      setLoading(false);
      return;
    }

    const generateSignedUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract just the path (remove any URL parts if present)
        const path = receiptPath.includes('/storage/v1/object/') 
          ? receiptPath.split('/storage/v1/object/public/receipts/')[1] || receiptPath
          : receiptPath;

        const { data, error: signError } = await supabase.storage
          .from('receipts')
          .createSignedUrl(path, expiresIn);

        if (signError) throw signError;

        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error('Error generating signed URL:', err);
        setError(err instanceof Error ? err : new Error('Failed to generate signed URL'));
        setSignedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    generateSignedUrl();
  }, [receiptPath, expiresIn]);

  return { signedUrl, loading, error };
}

/**
 * Batch generate signed URLs for multiple receipt paths
 * @param receiptPaths - Array of storage paths
 * @param expiresIn - Expiry time in seconds
 * @returns Promise resolving to map of path -> signed URL
 */
export async function generateSignedUrls(
  receiptPaths: (string | null | undefined)[],
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  const validPaths = receiptPaths.filter((path): path is string => Boolean(path));

  await Promise.all(
    validPaths.map(async (receiptPath) => {
      try {
        // Extract just the path (remove any URL parts if present)
        const path = receiptPath.includes('/storage/v1/object/') 
          ? receiptPath.split('/storage/v1/object/public/receipts/')[1] || receiptPath
          : receiptPath;

        const { data, error } = await supabase.storage
          .from('receipts')
          .createSignedUrl(path, expiresIn);

        if (!error && data) {
          urlMap.set(receiptPath, data.signedUrl);
        }
      } catch (err) {
        console.error(`Error generating signed URL for ${receiptPath}:`, err);
      }
    })
  );

  return urlMap;
}
