-- Add new columns to work_entry_expenses for ticket scanning and company payment
ALTER TABLE public.work_entry_expenses 
ADD COLUMN IF NOT EXISTS ticket_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_company_paid BOOLEAN NOT NULL DEFAULT false;

-- Create storage bucket for ticket images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-images', 'ticket-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for ticket images
CREATE POLICY "Users can upload their own ticket images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own ticket images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ticket-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own ticket images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ticket-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Ticket images are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ticket-images');