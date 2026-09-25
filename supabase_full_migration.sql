-- ==============================================================================
-- MIGRACIÓN COMPLETA PARA SUPABASE - TU AUTO INTELIGENTE / AUTOSCORE CHILE
-- Proyecto: hzslatnfcliwkbhlhily
-- Copia y ejecuta este script completo en el SQL Editor de tu panel de Supabase
-- ==============================================================================

-- 1. EXTENDER LA TABLA EXISTENTE 'autos' CON CAMPOS DINÁMICOS ADICIONALES
ALTER TABLE IF EXISTS public.autos 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'SUV / Todoterreno',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS traccion TEXT DEFAULT 'AWD',
  ADD COLUMN IF NOT EXISTS transmision TEXT DEFAULT 'Automática';

-- 2. TABLA: FICHAS TÉCNICAS HOMOLOGADAS (3CV & MTT CHILE)
CREATE TABLE IF NOT EXISTS public.fichas_tecnicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_id UUID REFERENCES public.autos(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  potencia_hp INTEGER DEFAULT 156,
  potencia_rpm INTEGER DEFAULT 6000,
  torque_nm INTEGER DEFAULT 196,
  torque_rpm INTEGER DEFAULT 4000,
  cilindrada_cc INTEGER DEFAULT 1995,
  cilindros TEXT DEFAULT '4 Boxer / 16v',
  traccion TEXT DEFAULT 'AWD Simétrico',
  transmision TEXT DEFAULT 'Lineartronic CVT 7v',
  peso_kg INTEGER DEFAULT 1540,
  aceleracion_0_100 NUMERIC DEFAULT 10.3,
  velocidad_max INTEGER DEFAULT 198,
  consumo_ciudad NUMERIC DEFAULT 11.2,
  consumo_carretera NUMERIC DEFAULT 15.6,
  consumo_mixto NUMERIC DEFAULT 13.5,
  emisiones_co2 INTEGER DEFAULT 172,
  norma_emisiones TEXT DEFAULT 'Euro 6b',
  combustible_recomendado TEXT DEFAULT '95 Octanos',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: CRITERIOS DE EVALUACIÓN (NOTAS 1.0 A 5.0)
CREATE TABLE IF NOT EXISTS public.criterios_evaluacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_id UUID REFERENCES public.autos(id) ON DELETE CASCADE,
  confiabilidad NUMERIC DEFAULT 4.5,
  reventa NUMERIC DEFAULT 4.2,
  consumo NUMERIC DEFAULT 3.8,
  seguridad NUMERIC DEFAULT 4.7,
  modificabilidad NUMERIC DEFAULT 3.9,
  repuestos NUMERIC DEFAULT 4.0,
  prestaciones NUMERIC DEFAULT 3.6,
  score_ponderado NUMERIC DEFAULT 86.4,
  notas TEXT DEFAULT 'Excelente balance para uso mixto diario y viajes en Chile.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: PERFILES DE PONDERACIÓN (PESOS EDITABLES POR CATEGORÍA)
CREATE TABLE IF NOT EXISTS public.perfiles_ponderacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_vehiculo TEXT UNIQUE NOT NULL,
  peso_confiabilidad INTEGER DEFAULT 25,
  peso_reventa INTEGER DEFAULT 15,
  peso_consumo INTEGER DEFAULT 15,
  peso_seguridad INTEGER DEFAULT 15,
  peso_modificabilidad INTEGER DEFAULT 10,
  peso_repuestos INTEGER DEFAULT 10,
  peso_prestaciones INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: PRECIOS COMBUSTIBLE EN VIVO (CNE BENCINA EN LÍNEA CHILE)
CREATE TABLE IF NOT EXISTS public.cne_precios_combustible (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  gasolina_93 NUMERIC NOT NULL,
  gasolina_95 NUMERIC NOT NULL,
  gasolina_97 NUMERIC NOT NULL,
  diesel NUMERIC NOT NULL,
  glp NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: TASACIONES FISCALES Y PERMISO DE CIRCULACIÓN (SII CHILE)
CREATE TABLE IF NOT EXISTS public.sii_tasaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  tasacion_fiscal NUMERIC NOT NULL,
  permiso_circulacion_clp NUMERIC NOT NULL,
  codigo_sii TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: TARIFAS Y CALENDARIO PRT (MINISTERIO DE TRANSPORTES CHILE)
CREATE TABLE IF NOT EXISTS public.prt_tarifas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  tarifa_clp NUMERIC NOT NULL,
  plantas_disponibles INTEGER DEFAULT 24,
  calendario_patentes JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: COMPARADOR DE SEGURO SOAP (ASEGURADORAS CHILE)
CREATE TABLE IF NOT EXISTS public.soap_comparador (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aseguradora TEXT NOT NULL,
  precio_auto_clp NUMERIC NOT NULL,
  precio_suv_clp NUMERIC NOT NULL,
  precio_camioneta_clp NUMERIC NOT NULL,
  vigencia_anio INTEGER DEFAULT 2025,
  link_compra TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA: PROYECCIONES TCO A 5 AÑOS (COSTO TOTAL DE PROPIEDAD)
CREATE TABLE IF NOT EXISTS public.tco_proyecciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_id UUID REFERENCES public.autos(id) ON DELETE CASCADE,
  horizonte_anios INTEGER DEFAULT 5,
  costo_combustible NUMERIC NOT NULL,
  costo_permiso_circulacion NUMERIC NOT NULL,
  costo_seguro_total NUMERIC NOT NULL,
  costo_prt NUMERIC NOT NULL,
  costo_mantenimiento NUMERIC NOT NULL,
  costo_repuestos_preventivos NUMERIC NOT NULL,
  depreciacion_estimada NUMERIC NOT NULL,
  tco_total NUMERIC NOT NULL,
  costo_mensual_promedio NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABLA: DISPONIBILIDAD Y PRECIO DE REPUESTOS EN CHILE (10 DE JULIO / WARNES)
CREATE TABLE IF NOT EXISTS public.repuestos_mercado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  disponibilidad_score TEXT DEFAULT 'Alta',
  sector_popular TEXT DEFAULT '10 de Julio / Santiago',
  precio_kit_filtros_clp NUMERIC DEFAULT 45000,
  precio_pastillas_freno_clp NUMERIC DEFAULT 65000,
  precio_amortiguadores_clp NUMERIC DEFAULT 180000,
  precio_embrague_clp NUMERIC DEFAULT 260000,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABLA: RED DE TALLERES & INSPECCIÓN PRE-COMPRA
CREATE TABLE IF NOT EXISTS public.talleres_inspeccion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  comuna TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  precio_inspeccion_clp NUMERIC DEFAULT 85000,
  descuento_pro_pct INTEGER DEFAULT 25,
  rating NUMERIC DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 142,
  disponible_hoy BOOLEAN DEFAULT true,
  servicios_incluidos JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. TABLA: RESERVAS DE CITAS DE INSPECCIÓN
CREATE TABLE IF NOT EXISTS public.inspecciones_reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  taller_id UUID REFERENCES public.talleres_inspeccion(id) ON DELETE CASCADE,
  auto_id UUID REFERENCES public.autos(id) ON DELETE SET NULL,
  nombre_cliente TEXT NOT NULL,
  telefono_cliente TEXT NOT NULL,
  fecha_reserva DATE NOT NULL,
  hora_reserva TEXT NOT NULL,
  estado TEXT DEFAULT 'confirmada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. TABLA: PLANES Y SUSCRIPCIONES AUTOSCORE PRO
CREATE TABLE IF NOT EXISTS public.suscripciones_pro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_nombre TEXT NOT NULL,
  precio_clp NUMERIC NOT NULL,
  periodicidad TEXT DEFAULT 'mensual',
  consultas_historial_mop INTEGER DEFAULT 10,
  descuento_talleres_pct INTEGER DEFAULT 30,
  beneficios JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- CONFIGURACIÓN DE POLÍTICAS DE ACCESO PÚBLICO (ROW LEVEL SECURITY)
-- ==============================================================================
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'autos', 'fichas_tecnicas', 'criterios_evaluacion', 'perfiles_ponderacion',
    'cne_precios_combustible', 'sii_tasaciones', 'prt_tarifas', 'soap_comparador',
    'tco_proyecciones', 'repuestos_mercado', 'talleres_inspeccion',
    'inspecciones_reservas', 'suscripciones_pro'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Política de Lectura Pública
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'permitir_select_publico', tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true);', 'permitir_select_publico', tbl);
    
    -- Política de Inserción Pública
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'permitir_insert_publico', tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (true);', 'permitir_insert_publico', tbl);

    -- Política de Actualización Pública
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'permitir_update_publico', tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (true) WITH CHECK (true);', 'permitir_update_publico', tbl);
  END LOOP;
END $$;

-- ==============================================================================
-- POBLADO INICIAL CON DATOS OFICIALES Y REALES DEL MERCADO CHILENO (SEED)
-- ==============================================================================

-- Poblado de Perfiles de Ponderación (%)
INSERT INTO public.perfiles_ponderacion (tipo_vehiculo, peso_confiabilidad, peso_reventa, peso_consumo, peso_seguridad, peso_modificabilidad, peso_repuestos, peso_prestaciones, is_active)
VALUES
  ('SUV / Todoterreno', 25, 15, 15, 15, 10, 10, 10, true),
  ('SUV / Muscle', 20, 10, 10, 15, 20, 10, 15, false),
  ('Sedán / Lujo', 20, 20, 15, 20, 5, 10, 10, false),
  ('Deportivo', 15, 10, 10, 15, 25, 10, 15, false),
  ('Compacto', 25, 20, 25, 15, 5, 5, 5, false),
  ('Pickup', 25, 20, 15, 15, 10, 10, 5, false)
ON CONFLICT (tipo_vehiculo) DO UPDATE SET
  peso_confiabilidad = EXCLUDED.peso_confiabilidad,
  peso_consumo = EXCLUDED.peso_consumo,
  updated_at = now();

-- Poblado CNE Bencina en Línea (Valores Reales RM y Regiones)
INSERT INTO public.cne_precios_combustible (region, gasolina_93, gasolina_95, gasolina_97, diesel, glp)
VALUES
  ('Región Metropolitana', 1280, 1320, 1380, 1050, 720),
  ('Valparaíso', 1285, 1325, 1385, 1055, 725),
  ('Biobío', 1290, 1330, 1390, 1060, 730),
  ('Los Lagos', 1310, 1350, 1410, 1080, 750)
ON CONFLICT DO NOTHING;

-- Poblado SII Tasaciones y Permisos 2025
INSERT INTO public.sii_tasaciones (marca, modelo, anio, tasacion_fiscal, permiso_circulacion_clp, codigo_sii)
VALUES
  ('Subaru', 'Forester', 2022, 16800000, 312500, 'SUB-FOR-2022'),
  ('Toyota', 'Hilux', 2022, 17900000, 345000, 'TOY-HIL-2022'),
  ('Jeep', 'Cherokee XJ', 1998, 3800000, 38500, 'JEP-CHE-1998'),
  ('BMW', '530i E39', 2001, 5200000, 68000, 'BMW-530-2001'),
  ('Toyota', 'RAV4', 2021, 15400000, 275000, 'TOY-RAV-2021'),
  ('Suzuki', 'Swift Sport', 2020, 11200000, 185000, 'SUZ-SWI-2020')
ON CONFLICT DO NOTHING;

-- Poblado PRT Tarifas MTT
INSERT INTO public.prt_tarifas (region, tarifa_clp, plantas_disponibles, calendario_patentes)
VALUES (
  'Región Metropolitana',
  18500,
  32,
  '{"0": "Febrero", "1": "Abril", "2": "Mayo", "3": "Junio", "4": "Julio", "5": "Agosto", "6": "Septiembre", "7": "Octubre", "8": "Noviembre", "9": "Diciembre"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Poblado SOAP Comparador
INSERT INTO public.soap_comparador (aseguradora, precio_auto_clp, precio_suv_clp, precio_camioneta_clp, vigencia_anio, link_compra)
VALUES
  ('Consorcio', 5490, 7890, 8990, 2025, 'https://consorcio.cl/soap'),
  ('BCI Seguros', 5690, 8190, 9290, 2025, 'https://bci.cl/seguros/soap'),
  ('Santander Seguros', 5890, 8390, 9490, 2025, 'https://santander.cl/soap'),
  ('Mapfre', 6190, 8790, 9890, 2025, 'https://mapfre.cl/soap')
ON CONFLICT DO NOTHING;

-- Poblado Repuestos 10 de Julio / Warnes
INSERT INTO public.repuestos_mercado (marca, modelo, disponibilidad_score, sector_popular, precio_kit_filtros_clp, precio_pastillas_freno_clp, precio_amortiguadores_clp, precio_embrague_clp)
VALUES
  ('Subaru', 'Forester', 'Alta', '10 de Julio / Barrio Brasil', 38000, 58000, 195000, 280000),
  ('Toyota', 'Hilux', 'Inmediata', '10 de Julio / San Eugenio', 32000, 48000, 160000, 240000),
  ('Jeep', 'Cherokee XJ', 'Alta (Aftermarket USA)', '10 de Julio / Importación Directa', 45000, 62000, 220000, 290000),
  ('BMW', '530i E39', 'Media (Especialistas OEM)', 'Avenida Matta / Warnes', 65000, 89000, 310000, 390000)
ON CONFLICT DO NOTHING;

-- Poblado Red de Talleres Verificados
INSERT INTO public.talleres_inspeccion (nombre, especialidad, comuna, direccion, telefono, precio_inspeccion_clp, descuento_pro_pct, rating, reviews_count, disponible_hoy, servicios_incluidos)
VALUES
  (
    'Taller Spezialist 4x4 & Americanos',
    'Especialista 4x4, Jeep & Japoneses',
    'Ñuñoa',
    'Av. Irarrázaval 4280, Santiago',
    '+56 9 8451 2290',
    89990,
    30,
    4.9,
    184,
    true,
    '["Scanner OBD2 Profesional", "Prueba de Compresión en Cilindros", "Fugas de Aceite y Caja", "Inspección Chasis / Soldaduras 4x4", "Grosor de Pintura y Choques Ocultos"]'::jsonb
  ),
  (
    'Centro Técnico Alemán Multimarca',
    'Sedanes de Alta Gama & SUV Modernos',
    'Las Condes',
    'Av. Vitacura 6120, Santiago',
    '+56 9 7312 9011',
    99990,
    25,
    4.8,
    215,
    true,
    '["Scanner Telemetría BMW/VAG", "Revisión Sistema Eléctrico", "Diagnóstico Suspensión Neumática", "Prueba de Ruta en Autopista"]'::jsonb
  ),
  (
    'AutoCheck Móvil Chile',
    'Inspección a Domicilio RM Completa',
    'Santiago Centro / A Domicilio',
    'Servicio Móvil con Camioneta Taller',
    '+56 9 6554 1100',
    79990,
    20,
    4.9,
    340,
    true,
    '["Inspección Mecánica en Casa del Vendedor", "Scanner Multimarca en Terreno", "Informe PDF con Fotos en 30 Minutos", "Revisión de Batería y Alternador"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Poblado Planes AutoScore PRO
INSERT INTO public.suscripciones_pro (plan_nombre, precio_clp, periodicidad, consultas_historial_mop, descuento_talleres_pct, beneficios)
VALUES
  (
    'Pase 1 Auto',
    4990,
    'unico',
    1,
    20,
    '["Informe Legal MOP y Multas JPL", "Historial de Remates CAV", "Ficha Oficial 3CV", "10% DCTO en Taller de Inspección"]'::jsonb
  ),
  (
    'AutoScore PRO Ilimitado',
    14990,
    'mensual',
    99,
    30,
    '["Consultas Ilimitadas de Patentes", "Historial de Dueños Anteriores", "Alertas de Kilometraje Alterado", "Hasta 30% DCTO en Red de Talleres", "Soporte Mecánico WhatsApp 24/7"]'::jsonb
  )
ON CONFLICT DO NOTHING;


-- TABLA DE CATÁLOGO HOMOLOGADO DE VEHÍCULOS CHILE (SII & 3CV)
CREATE TABLE IF NOT EXISTS public.catalogo_vehiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  version TEXT NOT NULL,
  categoria TEXT DEFAULT "SUV / Todoterreno",
  combustible TEXT DEFAULT "95",
  precio_promedio NUMERIC,
  tasacion_sii NUMERIC,
  permiso_clp NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone("utc"::text, now()) NOT NULL
);

ALTER TABLE public.catalogo_vehiculos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permitir_select_catalogo ON public.catalogo_vehiculos;
CREATE POLICY permitir_select_catalogo ON public.catalogo_vehiculos FOR SELECT USING (true);
DROP POLICY IF EXISTS permitir_insert_catalogo ON public.catalogo_vehiculos;
CREATE POLICY permitir_insert_catalogo ON public.catalogo_vehiculos FOR INSERT WITH CHECK (true);

INSERT INTO public.catalogo_vehiculos (marca, modelo, anio, version, categoria, combustible, precio_promedio, tasacion_sii, permiso_clp)
VALUES
  ('Toyota', 'Hilux', 2024, '2.4 D-4D DX 4x4 6MT (148 HP)', 'Pickup', 'diesel', 18500000, 17900000, 345000),
  ('Toyota', 'Hilux', 2024, '2.8 D-4D SRV 4x4 6AT (201 HP)', 'Pickup', 'diesel', 18500000, 17900000, 345000),
  ('Toyota', 'Hilux', 2024, '2.4 D-4D SR 4x2 6MT (148 HP)', 'Pickup', 'diesel', 18500000, 17900000, 345000),
  ('Toyota', 'Hilux', 2024, '2.8 GR-Sport 4x4 AT (221 HP)', 'Pickup', 'diesel', 18500000, 17900000, 345000),
  ('Toyota', 'Hilux', 2024, '2.7 VVT-i Gasolina 4x2 5MT (164 HP)', 'Pickup', 'diesel', 18500000, 17900000, 345000),
  ('Toyota', 'RAV4', 2024, '2.0 LE 4x2 CVT (170 HP)', 'SUV / Todoterreno', '95', 19800000, 15400000, 275000),
  ('Toyota', 'RAV4', 2024, '2.5 Hybrid AWD e-CVT (219 HP)', 'SUV / Todoterreno', '95', 19800000, 15400000, 275000),
  ('Toyota', 'RAV4', 2024, '2.5 Limited AWD 8AT (203 HP)', 'SUV / Todoterreno', '95', 19800000, 15400000, 275000),
  ('Toyota', 'RAV4', 2024, '2.0 XLE 4x4 6MT (170 HP)', 'SUV / Todoterreno', '95', 19800000, 15400000, 275000),
  ('Toyota', 'RAV4', 2024, '2.5 Adventure AWD 8AT (203 HP)', 'SUV / Todoterreno', '95', 19800000, 15400000, 275000),
  ('Toyota', 'Corolla', 2024, '2.0 SEG Direct Shift-CVT (170 HP)', 'Sedán / Lujo', '95', 14200000, 12800000, 210000),
  ('Toyota', 'Corolla', 2024, '1.8 Hybrid SEG e-CVT (122 HP)', 'Sedán / Lujo', '95', 14200000, 12800000, 210000),
  ('Toyota', 'Corolla', 2024, '2.0 XEI 6MT (170 HP)', 'Sedán / Lujo', '95', 14200000, 12800000, 210000),
  ('Toyota', 'Corolla', 2024, '1.8 GLI 6MT (138 HP)', 'Sedán / Lujo', '95', 14200000, 12800000, 210000),
  ('Toyota', '4Runner', 2024, '4.0 V6 SR5 4x4 5AT (270 HP)', 'SUV / Todoterreno', '95', 28900000, 24500000, 580000),
  ('Toyota', '4Runner', 2024, '4.0 V6 Limited 4WD 5AT (270 HP)', 'SUV / Todoterreno', '95', 28900000, 24500000, 580000),
  ('Toyota', '4Runner', 2024, '4.0 V6 TRD Pro 4x4 AT (270 HP)', 'SUV / Todoterreno', '95', 28900000, 24500000, 580000),
  ('Toyota', 'Yaris', 2024, '1.5 XLS 5MT Sedán (106 HP)', 'Compacto', '93', 11500000, 9800000, 145000),
  ('Toyota', 'Yaris', 2024, '1.5 S CVT Hatchback (106 HP)', 'Compacto', '93', 11500000, 9800000, 145000),
  ('Toyota', 'Yaris', 2024, '1.5 GLI 5MT Sedán (106 HP)', 'Compacto', '93', 11500000, 9800000, 145000),
  ('Toyota', 'Yaris', 2024, '1.5 GR-Sport CVT (106 HP)', 'Compacto', '93', 11500000, 9800000, 145000),
  ('Subaru', 'Forester', 2024, '2.0i AWD CVT Dynamic (156 HP)', 'SUV / Todoterreno', '95', 18900000, 16800000, 312500),
  ('Subaru', 'Forester', 2024, '2.5i AWD CVT Limited EyeSight (182 HP)', 'SUV / Todoterreno', '95', 18900000, 16800000, 312500),
  ('Subaru', 'Forester', 2024, '2.0i AWD 6MT X (150 HP)', 'SUV / Todoterreno', '95', 18900000, 16800000, 312500),
  ('Subaru', 'Forester', 2024, '2.0 e-Boxer Hybrid AWD CVT (150 HP)', 'SUV / Todoterreno', '95', 18900000, 16800000, 312500),
  ('Subaru', 'Forester', 2024, '2.0 XT Turbo AWD CVT (240 HP)', 'SUV / Todoterreno', '95', 18900000, 16800000, 312500),
  ('Subaru', 'XV / Crosstrek', 2024, '2.0i AWD CVT Premium EyeSight (156 HP)', 'SUV / Todoterreno', '95', 16500000, 14200000, 245000),
  ('Subaru', 'XV / Crosstrek', 2024, '2.0i AWD CVT Limited (156 HP)', 'SUV / Todoterreno', '95', 16500000, 14200000, 245000),
  ('Subaru', 'XV / Crosstrek', 2024, '1.6i AWD 5MT X (114 HP)', 'SUV / Todoterreno', '95', 16500000, 14200000, 245000),
  ('Subaru', 'XV / Crosstrek', 2024, '2.0 e-Boxer Hybrid AWD CVT', 'SUV / Todoterreno', '95', 16500000, 14200000, 245000),
  ('Subaru', 'Outback', 2024, '2.5i AWD Limited EyeSight CVT (188 HP)', 'SUV / Todoterreno', '95', 23500000, 20800000, 435000),
  ('Subaru', 'Outback', 2024, '2.4 XT Turbo AWD Touring CVT (260 HP)', 'SUV / Todoterreno', '95', 23500000, 20800000, 435000),
  ('Subaru', 'Outback', 2024, '3.6R 6-Cilindros Boxer AWD (256 HP)', 'SUV / Todoterreno', '95', 23500000, 20800000, 435000),
  ('Subaru', 'Outback', 2024, '2.0D Boxer Diésel AWD 6MT', 'SUV / Todoterreno', '95', 23500000, 20800000, 435000),
  ('Subaru', 'WRX', 2024, '2.4 Turbo AWD 6MT (271 HP)', 'Deportivo', '97', 26900000, 22400000, 490000),
  ('Subaru', 'WRX', 2024, '2.4 Turbo AWD SPT CVT EyeSight (271 HP)', 'Deportivo', '97', 26900000, 22400000, 490000),
  ('Subaru', 'WRX', 2024, '2.0 Turbo AWD 6MT (268 HP)', 'Deportivo', '97', 26900000, 22400000, 490000),
  ('Subaru', 'WRX', 2024, '2.5 Turbo STI AWD 6MT (305 HP)', 'Deportivo', '97', 26900000, 22400000, 490000),
  ('Subaru', 'Impreza', 2024, '2.0i AWD CVT Dynamic (156 HP)', 'Hatchback', '95', 13900000, 11500000, 178000),
  ('Subaru', 'Impreza', 2024, '2.0R AWD 5MT Sedán (150 HP)', 'Hatchback', '95', 13900000, 11500000, 178000),
  ('Subaru', 'Impreza', 2024, '1.6i AWD 5MT Hatchback (114 HP)', 'Hatchback', '95', 13900000, 11500000, 178000),
  ('Jeep', 'Cherokee XJ', 2001, '4.0L High Output 6L 4x4 AW4 Auto (190 HP)', 'SUV / Muscle', '93', 5500000, 3800000, 38500),
  ('Jeep', 'Cherokee XJ', 2001, '4.0L Sport 4x4 Manual 5MT AX15 (190 HP)', 'SUV / Muscle', '93', 5500000, 3800000, 38500),
  ('Jeep', 'Cherokee XJ', 2001, '2.5L 4-Cilindros 4x4 5MT (125 HP)', 'SUV / Muscle', '93', 5500000, 3800000, 38500),
  ('Jeep', 'Grand Cherokee', 2024, '3.6L V6 Pentastar Laredo 4x4 8AT (293 HP)', 'SUV / Muscle', '95', 27500000, 23400000, 520000),
  ('Jeep', 'Grand Cherokee', 2024, '5.7L V8 HEMI Limited 4WD 8AT (360 HP)', 'SUV / Muscle', '95', 27500000, 23400000, 520000),
  ('Jeep', 'Grand Cherokee', 2024, '3.0L V6 CRD Turbo Diésel 4x4 8AT (241 HP)', 'SUV / Muscle', '95', 27500000, 23400000, 520000),
  ('Jeep', 'Grand Cherokee', 2024, '6.4L V8 SRT 4x4 8AT (475 HP)', 'SUV / Muscle', '95', 27500000, 23400000, 520000),
  ('Jeep', 'Wrangler', 2024, '3.6L V6 Rubicon Unlimited 4x4 8AT (285 HP)', 'SUV / Todoterreno', '95', 34900000, 29800000, 720000),
  ('Jeep', 'Wrangler', 2024, '2.0 Turbo Sahara 4x4 8AT (270 HP)', 'SUV / Todoterreno', '95', 34900000, 29800000, 720000),
  ('Jeep', 'Wrangler', 2024, '3.6L V6 Sport 4x4 6MT 2 Puertas (285 HP)', 'SUV / Todoterreno', '95', 34900000, 29800000, 720000),
  ('Jeep', 'Compass', 2024, '1.3 Turbo T270 Longitude 4x2 6AT (175 HP)', 'SUV / Todoterreno', '95', 15800000, 13900000, 225000),
  ('Jeep', 'Compass', 2024, '2.4 Tigershark Sport 4x2 5MT (180 HP)', 'SUV / Todoterreno', '95', 15800000, 13900000, 225000),
  ('Jeep', 'Compass', 2024, '2.0 Multijet Diésel Trailhawk 4x4 9AT (170 HP)', 'SUV / Todoterreno', '95', 15800000, 13900000, 225000),
  ('BMW', 'Serie 3 (320i / 330i)', 2024, '320i 2.0 Turbo Sport Line Steptronic 8v (184 HP)', 'Sedán / Lujo', '97', 28500000, 24800000, 590000),
  ('BMW', 'Serie 3 (320i / 330i)', 2024, '330i 2.0 Turbo M Sport Steptronic 8v (258 HP)', 'Sedán / Lujo', '97', 28500000, 24800000, 590000),
  ('BMW', 'Serie 3 (320i / 330i)', 2024, 'M340i xDrive 3.0T 6L Mild-Hybrid (387 HP)', 'Sedán / Lujo', '97', 28500000, 24800000, 590000),
  ('BMW', 'Serie 3 (320i / 330i)', 2024, '320d 2.0 Turbo Diésel Steptronic (190 HP)', 'Sedán / Lujo', '97', 28500000, 24800000, 590000),
  ('BMW', 'Serie 5 (530i / 520d)', 2023, '3.0L M54 6L Steptronic (E39 231 HP)', 'Sedán / Lujo', '97', 22900000, 18900000, 410000),
  ('BMW', 'Serie 5 (530i / 520d)', 2023, '530i 2.0 Turbo M Sport Steptronic (G30 252 HP)', 'Sedán / Lujo', '97', 22900000, 18900000, 410000),
  ('BMW', 'Serie 5 (530i / 520d)', 2023, '520d 2.0 Diésel Executive Steptronic (190 HP)', 'Sedán / Lujo', '97', 22900000, 18900000, 410000),
  ('BMW', 'Serie 5 (530i / 520d)', 2023, '535i 3.0 Turbo N55 Steptronic (F10 306 HP)', 'Sedán / Lujo', '97', 22900000, 18900000, 410000),
  ('BMW', 'X3', 2024, 'xDrive20i 2.0 Turbo xLine AT8 (184 HP)', 'SUV / Todoterreno', '97', 31500000, 26900000, 680000),
  ('BMW', 'X3', 2024, 'xDrive30i 2.0 Turbo M Sport AT8 (252 HP)', 'SUV / Todoterreno', '97', 31500000, 26900000, 680000),
  ('BMW', 'X3', 2024, 'xDrive20d 2.0 Turbo Diésel AT8 (190 HP)', 'SUV / Todoterreno', '97', 31500000, 26900000, 680000),
  ('BMW', 'X3', 2024, 'M40i 3.0T 6L xDrive AT8 (360 HP)', 'SUV / Todoterreno', '97', 31500000, 26900000, 680000),
  ('Suzuki', 'Swift / Swift Sport', 2024, '1.4 Boosterjet Turbo Sport 6MT (138 HP)', 'Compacto', '95', 12800000, 11200000, 185000),
  ('Suzuki', 'Swift / Swift Sport', 2024, '1.4 Boosterjet Turbo Sport 6AT (138 HP)', 'Compacto', '95', 12800000, 11200000, 185000),
  ('Suzuki', 'Swift / Swift Sport', 2024, '1.2 Dualjet GLX Hybrid 5MT (83 HP)', 'Compacto', '95', 12800000, 11200000, 185000),
  ('Suzuki', 'Swift / Swift Sport', 2024, '1.2 GL 5MT (82 HP)', 'Compacto', '95', 12800000, 11200000, 185000),
  ('Suzuki', 'Swift / Swift Sport', 2024, '1.6 Sport 6MT (136 HP)', 'Compacto', '95', 12800000, 11200000, 185000),
  ('Suzuki', 'Grand Vitara / Vitara', 2024, '1.4 Boosterjet AllGrip 4x4 6AT (138 HP)', 'SUV / Todoterreno', '95', 14900000, 12800000, 215000),
  ('Suzuki', 'Grand Vitara / Vitara', 2024, '1.6 GLX 4x2 5MT (118 HP)', 'SUV / Todoterreno', '95', 14900000, 12800000, 215000),
  ('Suzuki', 'Grand Vitara / Vitara', 2024, '1.5 Hybrid Dualjet AllGrip 6AT (101 HP)', 'SUV / Todoterreno', '95', 14900000, 12800000, 215000),
  ('Suzuki', 'Grand Vitara / Vitara', 2024, '2.4 VVT 4x4 5MT Grand Vitara (166 HP)', 'SUV / Todoterreno', '95', 14900000, 12800000, 215000),
  ('Suzuki', 'Grand Vitara / Vitara', 2024, '2.0 4x4 5MT 3 Puertas (140 HP)', 'SUV / Todoterreno', '95', 14900000, 12800000, 215000),
  ('Suzuki', 'Jimny', 2024, '1.5 GLX AllGrip 4x4 5MT (102 HP)', 'SUV / Todoterreno', '95', 15900000, 13900000, 240000),
  ('Suzuki', 'Jimny', 2024, '1.5 GLX AllGrip 4x4 4AT (102 HP)', 'SUV / Todoterreno', '95', 15900000, 13900000, 240000),
  ('Suzuki', 'Jimny', 2024, '1.5 GL 5MT 5 Puertas (102 HP)', 'SUV / Todoterreno', '95', 15900000, 13900000, 240000),
  ('Suzuki', 'Jimny', 2024, '1.3 VVT 4x4 5MT (85 HP)', 'SUV / Todoterreno', '95', 15900000, 13900000, 240000),
  ('Mazda', 'CX-5', 2024, '2.0 SkyActiv-G 2WD 6AT Core (154 HP)', 'SUV / Todoterreno', '95', 19500000, 16900000, 315000),
  ('Mazda', 'CX-5', 2024, '2.5 SkyActiv-G AWD 6AT Limited (188 HP)', 'SUV / Todoterreno', '95', 19500000, 16900000, 315000),
  ('Mazda', 'CX-5', 2024, '2.5 Turbo SkyActiv-G AWD Signature (228 HP)', 'SUV / Todoterreno', '95', 19500000, 16900000, 315000),
  ('Mazda', 'CX-5', 2024, '2.2 SkyActiv-D Diésel AWD 6AT (188 HP)', 'SUV / Todoterreno', '95', 19500000, 16900000, 315000),
  ('Mazda', 'Mazda 3', 2024, '2.0 SkyActiv-G 6MT Core Sedán (153 HP)', 'Hatchback', '95', 15400000, 13500000, 230000),
  ('Mazda', 'Mazda 3', 2024, '2.5 SkyActiv-G 6AT High Hatchback (186 HP)', 'Hatchback', '95', 15400000, 13500000, 230000),
  ('Mazda', 'Mazda 3', 2024, '2.5 Turbo AWD 6AT Signature (227 HP)', 'Hatchback', '95', 15400000, 13500000, 230000),
  ('Mazda', 'Mazda 3', 2024, '1.5 SkyActiv-G 6MT Core (118 HP)', 'Hatchback', '95', 15400000, 13500000, 230000),
  ('Mazda', 'CX-30', 2024, '2.0 SkyActiv-G 2WD 6AT Core (153 HP)', 'SUV / Todoterreno', '95', 16900000, 14800000, 265000),
  ('Mazda', 'CX-30', 2024, '2.5 SkyActiv-G AWD 6AT High (186 HP)', 'SUV / Todoterreno', '95', 16900000, 14800000, 265000),
  ('Mazda', 'CX-30', 2024, '2.0 SkyActiv-G 2WD 6MT V (153 HP)', 'SUV / Todoterreno', '95', 16900000, 14800000, 265000),
  ('Hyundai', 'Tucson', 2024, '2.0 MPI 4x2 6MT Value (154 HP)', 'SUV / Todoterreno', '95', 18200000, 15900000, 290000),
  ('Hyundai', 'Tucson', 2024, '1.6 Turbo GDI AWD 7DCT Limited (178 HP)', 'SUV / Todoterreno', '95', 18200000, 15900000, 290000),
  ('Hyundai', 'Tucson', 2024, '2.0 CRDi Turbo Diésel AWD 8AT (183 HP)', 'SUV / Todoterreno', '95', 18200000, 15900000, 290000),
  ('Hyundai', 'Santa Fe', 2024, '2.2 CRDi Turbo Diésel 4WD 8DCT (200 HP)', 'SUV / Todoterreno', 'diesel', 25900000, 22500000, 480000),
  ('Hyundai', 'Santa Fe', 2024, '2.5 MPI 4x2 6AT Value 3 Filas (178 HP)', 'SUV / Todoterreno', 'diesel', 25900000, 22500000, 480000),
  ('Hyundai', 'Santa Fe', 2024, '1.6 Turbo Híbrido AWD 6AT (227 HP)', 'SUV / Todoterreno', 'diesel', 25900000, 22500000, 480000),
  ('Ford', 'Ranger', 2024, '3.0 V6 Turbo Diésel Limited+ 4WD 10AT (247 HP)', 'Pickup', 'diesel', 26500000, 23100000, 495000),
  ('Ford', 'Ranger', 2024, '2.0 Bi-Turbo XLT 4x4 10AT (207 HP)', 'Pickup', 'diesel', 26500000, 23100000, 495000),
  ('Ford', 'Ranger', 2024, '3.2 TDCi 5-Cilindros Limited 4x4 6AT (197 HP)', 'Pickup', 'diesel', 26500000, 23100000, 495000),
  ('Ford', 'Ranger', 2024, '2.2 TDCi XL 4x4 6MT (158 HP)', 'Pickup', 'diesel', 26500000, 23100000, 495000),
  ('Ford', 'F-150', 2024, '3.5 V6 EcoBoost Lariat 4x4 10AT (400 HP)', 'Pickup', '95', 42000000, 36500000, 950000),
  ('Ford', 'F-150', 2024, '5.0 V8 Coyote XLT 4x4 10AT (400 HP)', 'Pickup', '95', 42000000, 36500000, 950000),
  ('Ford', 'F-150', 2024, '3.5 V6 PowerBoost Hybrid Limited (430 HP)', 'Pickup', '95', 42000000, 36500000, 950000);
