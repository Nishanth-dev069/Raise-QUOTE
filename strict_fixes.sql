-- ================================================================
-- STRICT FIXES: RLS POLICIES
-- ================================================================

-- A) ADMIN PANEL FIXES
-- ================================================================

-- A1. Users Page - View Access
-- Ensure Admin can view all users (profiles)
DROP POLICY IF EXISTS "Admin full read access users" ON public.profiles;
CREATE POLICY "Admin full read access users"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- A2. Users Page - Add User
-- Ensure Admin can insert new users (profiles)
DROP POLICY IF EXISTS "Admin full insert access users" ON public.profiles;
CREATE POLICY "Admin full insert access users"
ON public.profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Ensure Admin can update users (profiles) - Required for Edit/Deactivate
DROP POLICY IF EXISTS "Admin full update access users" ON public.profiles;
CREATE POLICY "Admin full update access users"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Ensure Admin can delete users (profiles)
DROP POLICY IF EXISTS "Admin full delete access users" ON public.profiles;
CREATE POLICY "Admin full delete access users"
ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- B) SALES PANEL FIXES
-- ================================================================

-- B1. Quotations View Access
-- Users can view own quotations only
DROP POLICY IF EXISTS "Users can view own quotations only" ON public.quotations;
CREATE POLICY "Users can view own quotations only"
ON public.quotations
FOR SELECT
USING (
  created_by = auth.uid()
);

-- Admin can view all quotations
DROP POLICY IF EXISTS "Admin can view all quotations" ON public.quotations;
CREATE POLICY "Admin can view all quotations"
ON public.quotations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Ensure Users can insert their own quotations
DROP POLICY IF EXISTS "Users can insert own quotations" ON public.quotations;
CREATE POLICY "Users can insert own quotations"
ON public.quotations
FOR INSERT
WITH CHECK (
  created_by = auth.uid()
);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
