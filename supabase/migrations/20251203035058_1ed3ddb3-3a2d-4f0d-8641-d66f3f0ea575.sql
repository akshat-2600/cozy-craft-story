-- Make the payment-screenshots bucket public so admins can view the screenshots
UPDATE storage.buckets SET public = true WHERE id = 'payment-screenshots';