
-- Helper function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Trekker',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Trekker'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trek logs table
CREATE TABLE public.trek_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_title TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  distance_km NUMERIC(6,1) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  elevation_gain INTEGER NOT NULL DEFAULT 0,
  rating INTEGER NOT NULL DEFAULT 3,
  notes TEXT DEFAULT '',
  trek_type TEXT NOT NULL DEFAULT 'solo',
  companions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trek_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trek logs"
  ON public.trek_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trek logs"
  ON public.trek_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trek logs"
  ON public.trek_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trek logs"
  ON public.trek_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Saved trails table
CREATE TABLE public.saved_trails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_trail_id TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT DEFAULT 'Nearby',
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Moderate',
  distance NUMERIC(6,1) NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  elevation INTEGER,
  type_icon TEXT DEFAULT '⛰️',
  type_label TEXT DEFAULT 'Trail',
  is_high_rated BOOLEAN DEFAULT false,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, external_trail_id)
);

ALTER TABLE public.saved_trails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved trails"
  ON public.saved_trails FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can save trails"
  ON public.saved_trails FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave trails"
  ON public.saved_trails FOR DELETE TO authenticated USING (auth.uid() = user_id);
