-- ==============================================================================
-- Esquema para la Base de Datos en Supabase (Proyecto: hzslatnfcliwkbhlhily)
-- Copia y pega este script en el "SQL Editor" de tu panel de Supabase y dale a "Run"
-- ==============================================================================

-- 1. Crear la tabla 'autos'
CREATE TABLE IF NOT EXISTS public.autos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  version TEXT,
  price NUMERIC,
  kms INTEGER,
  annual_km INTEGER DEFAULT 15000,
  fuel_type TEXT DEFAULT '95',
  score NUMERIC DEFAULT 86.4
);

-- 2. Habilitar seguridad por fila (Row Level Security - RLS)
ALTER TABLE public.autos ENABLE ROW LEVEL SECURITY;

-- 3. Permitir guardar autos desde la aplicación web (clave anónima/pública)
CREATE POLICY "Permitir inserciones publicas" ON public.autos
  FOR INSERT
  WITH CHECK (true);

-- 4. Permitir consultar los autos guardados
CREATE POLICY "Permitir lectura publica" ON public.autos
  FOR SELECT
  USING (true);

-- Comentario de confirmación
COMMENT ON TABLE public.autos IS 'Tabla de vehículos evaluados desde la interfaz de Stitch';
