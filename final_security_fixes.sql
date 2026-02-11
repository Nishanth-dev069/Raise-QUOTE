-- ================================================================
-- FINAL STICT SECURITY & RLS FIXES
-- ================================================================

-- 1. PROFILES (Users) - Fix "Unauthorized" for Admins
-- ================================================================
-- Allow admins to read all profiles (to list users)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. PRODUCTS - Fix RLS Insert & Missing Column
-- ================================================================
-- Ensure 'features' column exists (JSONB as per best practice)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Policy: Authenticated users (Sales/Admin) can VIEW products
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins can INSERT products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Policy: Admins can UPDATE products
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Policy: Admins can DELETE products
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- 3. QUOTATIONS - Fix "See other users' quotes" & Admin Access
-- ================================================================
-- Policy: Users can view ONLY their own quotations
DROP POLICY IF EXISTS "Users can view own quotations" ON public.quotations;
CREATE POLICY "Users can view own quotations"
ON public.quotations
FOR SELECT
USING (
  auth.uid() = created_by
);

-- Policy: Admins can view ALL quotations
DROP POLICY IF EXISTS "Admins can view all quotations" ON public.quotations;
CREATE POLICY "Admins can view all quotations"
ON public.quotations
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- 4. STORAGE - Fix PDF & Image Access
-- ================================================================
-- Bucket: products (Public Read, Admin Insert)
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read products" ON storage.objects;
CREATE POLICY "Public read products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins insert products" ON storage.objects;
CREATE POLICY "Admins insert products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Bucket: quotations-pdfs (Private, Admin/Owner Access)
INSERT INTO storage.buckets (id, name, public) VALUES ('quotations-pdfs', 'quotations-pdfs', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users view own pdfs" ON storage.objects;
CREATE POLICY "Users view own pdfs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'quotations-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1] 
); 
-- Note: The above assumes folder structure matches user ID, closely enough for general protection.
-- Better specific policy for PDFs if paths are typically 'quotations-pdfs/filename.pdf':

DROP POLICY IF EXISTS "Admins view all pdfs" ON storage.objects;
CREATE POLICY "Admins view all pdfs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'quotations-pdfs'
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
