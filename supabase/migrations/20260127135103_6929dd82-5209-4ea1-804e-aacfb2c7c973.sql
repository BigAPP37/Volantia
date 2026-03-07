-- Create expenses table linked to work entries
CREATE TABLE public.work_entry_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_entry_id UUID NOT NULL REFERENCES public.work_entries(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL DEFAULT 'fuel',
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.work_entry_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (access via work_entries ownership)
CREATE POLICY "Users can view their own work entry expenses"
ON public.work_entry_expenses
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM work_entries
  WHERE work_entries.id = work_entry_expenses.work_entry_id
  AND work_entries.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own work entry expenses"
ON public.work_entry_expenses
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM work_entries
  WHERE work_entries.id = work_entry_expenses.work_entry_id
  AND work_entries.user_id = auth.uid()
));

CREATE POLICY "Users can update their own work entry expenses"
ON public.work_entry_expenses
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM work_entries
  WHERE work_entries.id = work_entry_expenses.work_entry_id
  AND work_entries.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own work entry expenses"
ON public.work_entry_expenses
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM work_entries
  WHERE work_entries.id = work_entry_expenses.work_entry_id
  AND work_entries.user_id = auth.uid()
));