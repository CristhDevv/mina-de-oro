-- ─── Fase 2: Modelo de datos Alegra ──────────────────────────────────────────
-- Migración segura: ADD COLUMN IF NOT EXISTS y CREATE TABLE IF NOT EXISTS
-- en todos los casos, para no romper si se ejecuta dos veces.

-- ─── 1. Tabla warehouses ──────────────────────────────────────────────────────
-- Representa los puntos físicos del negocio (locales, puntos de despacho).
-- alegra_warehouse_id vincula cada fila con la bodega correspondiente en Alegra.
CREATE TABLE IF NOT EXISTS public.warehouses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  address             TEXT,
  active              BOOLEAN     NOT NULL DEFAULT true,
  alegra_warehouse_id INTEGER,   -- id numérico de la bodega en Alegra (nullable)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para lookups por alegra_warehouse_id
CREATE INDEX IF NOT EXISTS idx_warehouses_alegra_id
  ON public.warehouses (alegra_warehouse_id)
  WHERE alegra_warehouse_id IS NOT NULL;

-- RLS: solo admins leen y escriben
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON public.warehouses
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ─── 2. Columnas nuevas en products ───────────────────────────────────────────
-- Producto sin estos campos sigue funcionando exactamente igual que hoy.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS alegra_item_id  INTEGER,   -- id del ítem en Alegra
  ADD COLUMN IF NOT EXISTS alegra_reference TEXT;     -- referencia/código del ítem en Alegra

-- Índice para lookups por alegra_item_id (frecuente en sync)
CREATE INDEX IF NOT EXISTS idx_products_alegra_item_id
  ON public.products (alegra_item_id)
  WHERE alegra_item_id IS NOT NULL;

-- ─── 3. Tabla alegra_stock_cache ──────────────────────────────────────────────
-- Caché local del stock por bodega, leído desde Alegra periódicamente.
-- No reemplaza la columna stock de products; coexiste con ella.
-- Solo existe una fila por (alegra_item_id, warehouse_id).
CREATE TABLE IF NOT EXISTS public.alegra_stock_cache (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  alegra_item_id      INTEGER     NOT NULL,
  warehouse_id        UUID        REFERENCES public.warehouses (id) ON DELETE SET NULL,
  alegra_warehouse_id INTEGER,   -- denormalizado para queries sin JOIN
  quantity            INTEGER     NOT NULL DEFAULT 0,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (alegra_item_id, alegra_warehouse_id)  -- una fila por ítem × bodega
);

CREATE INDEX IF NOT EXISTS idx_alegra_stock_cache_product_id
  ON public.alegra_stock_cache (product_id);

CREATE INDEX IF NOT EXISTS idx_alegra_stock_cache_item_warehouse
  ON public.alegra_stock_cache (alegra_item_id, alegra_warehouse_id);

-- RLS: solo admins pueden leer la caché directamente;
-- el servicio de sync usa service_role (bypass RLS)
ALTER TABLE public.alegra_stock_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON public.alegra_stock_cache
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ─── 4. Tabla alegra_sync_log ─────────────────────────────────────────────────
-- Auditoría de cada ajuste de inventario enviado a Alegra.
-- No afecta la lógica de negocio; es solo observabilidad y diagnóstico.
-- result: 'pending' mientras la llamada está en vuelo, 'success' o 'error' al terminar.
CREATE TABLE IF NOT EXISTS public.alegra_sync_log (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key     TEXT        NOT NULL UNIQUE, -- adj_{order_id}_{product_id}
  order_id            UUID        NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id          UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  warehouse_id        UUID        REFERENCES public.warehouses (id) ON DELETE SET NULL,
  alegra_item_id      INTEGER     NOT NULL,
  alegra_warehouse_id INTEGER,
  quantity            INTEGER     NOT NULL,        -- siempre positivo; dirección definida por operation_type
  operation_type      TEXT        NOT NULL DEFAULT 'out', -- 'out' = salida de inventario
  result              TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (result IN ('pending', 'success', 'error')),
  alegra_adjustment_id INTEGER,                   -- id del ajuste creado en Alegra (si exitoso)
  error_message       TEXT,                       -- mensaje de error de Alegra (si falló)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_alegra_sync_log_order_id
  ON public.alegra_sync_log (order_id);

CREATE INDEX IF NOT EXISTS idx_alegra_sync_log_result
  ON public.alegra_sync_log (result)
  WHERE result IN ('pending', 'error');

CREATE INDEX IF NOT EXISTS idx_alegra_sync_log_idempotency_key
  ON public.alegra_sync_log (idempotency_key);

-- RLS: solo admins
ALTER TABLE public.alegra_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON public.alegra_sync_log
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
