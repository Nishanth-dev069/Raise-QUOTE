-- 1. Add missing 'features' column to products table if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- 2. Add missing SKU and Category columns if they don't exist (just in case)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Fix Storage RLS for Product Images
-- Allow authenticated users (admins) to upload to the 'products' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public read" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'products');

-- 4. Ensure Products table is writable by authenticated users (admins)
-- This might be the cause of "new row violates row-level security policy" on insert
CREATE POLICY "Enable insert for authenticated users only" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 5. Grant usage on sequences if needed (optional but good for stability)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
