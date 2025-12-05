-- Make payment-screenshots bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'payment-screenshots';

-- Drop existing permissive policies if any
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view payment screenshots" ON storage.objects;

-- Create proper RLS policies for payment-screenshots bucket
-- Users can upload their own payment screenshots
CREATE POLICY "Users can upload own payment screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own payment screenshots
CREATE POLICY "Users can view own payment screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Admins can view all payment screenshots
CREATE POLICY "Admins can view all payment screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' 
  AND has_role(auth.uid(), 'admin'::app_role)
);