-- Drop the overly restrictive storage policy
DROP POLICY IF EXISTS "Users can upload payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment screenshots" ON storage.objects;

-- Create simpler policies that allow authenticated users to upload
CREATE POLICY "Authenticated users can upload payment screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

-- Anyone can view payment screenshots (bucket is public)
CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots');