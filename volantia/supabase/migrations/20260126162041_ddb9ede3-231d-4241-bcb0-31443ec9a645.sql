-- Create custom_rates table for user-defined extras
CREATE TABLE public.custom_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  rate NUMERIC NOT NULL DEFAULT 0,
  rate_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'quantity'
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own custom rates"
ON public.custom_rates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom rates"
ON public.custom_rates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom rates"
ON public.custom_rates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom rates"
ON public.custom_rates FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_rates_updated_at
BEFORE UPDATE ON public.custom_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create junction table for work entries <-> custom rates
CREATE TABLE public.work_entry_custom_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_entry_id UUID NOT NULL REFERENCES public.work_entries(id) ON DELETE CASCADE,
  custom_rate_id UUID NOT NULL REFERENCES public.custom_rates(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  rate_snapshot NUMERIC NOT NULL, -- Store rate at time of entry
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(work_entry_id, custom_rate_id)
);

-- Enable RLS
ALTER TABLE public.work_entry_custom_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from work_entries ownership)
CREATE POLICY "Users can view their own work entry custom rates"
ON public.work_entry_custom_rates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.work_entries 
    WHERE work_entries.id = work_entry_id 
    AND work_entries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own work entry custom rates"
ON public.work_entry_custom_rates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.work_entries 
    WHERE work_entries.id = work_entry_id 
    AND work_entries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own work entry custom rates"
ON public.work_entry_custom_rates FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.work_entries 
    WHERE work_entries.id = work_entry_id 
    AND work_entries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own work entry custom rates"
ON public.work_entry_custom_rates FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.work_entries 
    WHERE work_entries.id = work_entry_id 
    AND work_entries.user_id = auth.uid()
  )
);