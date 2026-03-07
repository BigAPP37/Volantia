-- Create route templates table
CREATE TABLE public.route_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER NOT NULL DEFAULT 30,
  service_type TEXT NOT NULL DEFAULT 'regular',
  scope TEXT NOT NULL DEFAULT 'national',
  full_diets INTEGER NOT NULL DEFAULT 0,
  half_diets INTEGER NOT NULL DEFAULT 0,
  overnights INTEGER NOT NULL DEFAULT 0,
  night_hours NUMERIC NOT NULL DEFAULT 0,
  half_night_hours NUMERIC NOT NULL DEFAULT 0,
  extra_hours NUMERIC NOT NULL DEFAULT 0,
  kilometers INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.route_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own templates"
  ON public.route_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON public.route_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.route_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.route_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_route_templates_updated_at
  BEFORE UPDATE ON public.route_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();