-- Create table for calendar day markers (non-work days)
CREATE TABLE public.day_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  marker_type TEXT NOT NULL DEFAULT 'rest',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.day_markers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own day markers"
  ON public.day_markers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own day markers"
  ON public.day_markers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own day markers"
  ON public.day_markers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own day markers"
  ON public.day_markers FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_day_markers_updated_at
  BEFORE UPDATE ON public.day_markers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();