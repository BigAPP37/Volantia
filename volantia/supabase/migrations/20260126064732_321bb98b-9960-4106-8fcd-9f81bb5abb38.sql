-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Conductor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create work_entries table for syncing services
CREATE TABLE public.work_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  service_type TEXT NOT NULL DEFAULT 'regular' CHECK (service_type IN ('regular', 'extra', 'rest', 'sick')),
  scope TEXT NOT NULL DEFAULT 'national' CHECK (scope IN ('national', 'international')),
  full_diets INTEGER NOT NULL DEFAULT 0,
  half_diets INTEGER NOT NULL DEFAULT 0,
  overnights INTEGER NOT NULL DEFAULT 0,
  night_hours DECIMAL(4,1) NOT NULL DEFAULT 0,
  half_night_hours DECIMAL(4,1) NOT NULL DEFAULT 0,
  extra_hours DECIMAL(4,1) NOT NULL DEFAULT 0,
  kilometers INTEGER NOT NULL DEFAULT 0,
  tips DECIMAL(8,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on work_entries
ALTER TABLE public.work_entries ENABLE ROW LEVEL SECURITY;

-- Work entries policies
CREATE POLICY "Users can view their own entries"
  ON public.work_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
  ON public.work_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.work_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.work_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_settings table for financial configuration
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  base_salary DECIMAL(10,2) NOT NULL DEFAULT 1500,
  fixed_bonuses DECIMAL(10,2) NOT NULL DEFAULT 200,
  irpf DECIMAL(5,2) NOT NULL DEFAULT 12,
  social_security DECIMAL(5,2) NOT NULL DEFAULT 4.7,
  mei DECIMAL(5,2) NOT NULL DEFAULT 0.13,
  unemployment DECIMAL(5,2) NOT NULL DEFAULT 1.55,
  full_diet_national DECIMAL(8,2) NOT NULL DEFAULT 35,
  half_diet_national DECIMAL(8,2) NOT NULL DEFAULT 17.50,
  overnight_national DECIMAL(8,2) NOT NULL DEFAULT 40,
  full_diet_international DECIMAL(8,2) NOT NULL DEFAULT 50,
  half_diet_international DECIMAL(8,2) NOT NULL DEFAULT 25,
  overnight_international DECIMAL(8,2) NOT NULL DEFAULT 60,
  weekend_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.25,
  extra_hour_rate DECIMAL(8,2) NOT NULL DEFAULT 15,
  night_hour_rate DECIMAL(8,2) NOT NULL DEFAULT 3,
  half_night_hour_rate DECIMAL(8,2) NOT NULL DEFAULT 1.5,
  kilometer_rate DECIMAL(6,3) NOT NULL DEFAULT 0.19,
  show_diets BOOLEAN NOT NULL DEFAULT true,
  show_overnights BOOLEAN NOT NULL DEFAULT true,
  show_night_hours BOOLEAN NOT NULL DEFAULT true,
  show_extra_hours BOOLEAN NOT NULL DEFAULT true,
  show_kilometers BOOLEAN NOT NULL DEFAULT true,
  show_tips BOOLEAN NOT NULL DEFAULT true,
  company_name TEXT,
  company_cif TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_entries_updated_at
  BEFORE UPDATE ON public.work_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Conductor'));
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile and settings on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_work_entries_user_id ON public.work_entries(user_id);
CREATE INDEX idx_work_entries_date ON public.work_entries(date);
CREATE INDEX idx_work_entries_user_date ON public.work_entries(user_id, date);