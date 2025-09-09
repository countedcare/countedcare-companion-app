-- Create gamification table for user progress and challenges
CREATE TABLE public.gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  challenges_completed INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own gamification data" 
ON public.gamification 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gamification data" 
ON public.gamification 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification data" 
ON public.gamification 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  url TEXT,
  is_favorited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own resources" 
ON public.resources 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resources" 
ON public.resources 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources" 
ON public.resources 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources" 
ON public.resources 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_quick_action TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_gamification_updated_at
BEFORE UPDATE ON public.gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();