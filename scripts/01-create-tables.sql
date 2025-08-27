-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT, -- 'google', 'github', 'email'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table for AI generated images
CREATE TABLE IF NOT EXISTS public.images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table for image likes
CREATE TABLE IF NOT EXISTS public.image_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, image_id)
);

-- Create collections table for user image collections
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_images junction table
CREATE TABLE IF NOT EXISTS public.collection_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, image_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_images ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for images
CREATE POLICY "Anyone can view public images" ON public.images FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own images" ON public.images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own images" ON public.images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON public.images FOR DELETE USING (auth.uid() = user_id);

-- Create policies for image likes
CREATE POLICY "Anyone can view likes" ON public.image_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.image_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.image_likes FOR DELETE USING (auth.uid() = user_id);

-- Create policies for collections
CREATE POLICY "Anyone can view public collections" ON public.collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Create policies for collection_images
CREATE POLICY "Users can view collection images if they can view the collection" ON public.collection_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collections 
    WHERE collections.id = collection_images.collection_id 
    AND (collections.is_public = true OR collections.user_id = auth.uid())
  )
);
CREATE POLICY "Users can manage own collection images" ON public.collection_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.collections 
    WHERE collections.id = collection_images.collection_id 
    AND collections.user_id = auth.uid()
  )
);

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON public.images FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
