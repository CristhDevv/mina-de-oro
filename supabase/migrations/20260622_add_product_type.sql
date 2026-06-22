-- Agrega columna product_type a la tabla products.
-- Default 'landing': todos los registros existentes y cualquier INSERT sin valor explícito
-- quedan automáticamente como 'landing', garantizando retrocompatibilidad total.
-- Los productos ecommerce nuevos DEBEN enviar product_type = 'ecommerce' explícitamente
-- desde el formulario / INSERT de aplicación.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'landing';

-- Constraint de integridad: sólo valores permitidos
ALTER TABLE public.products
  ADD CONSTRAINT products_product_type_check
  CHECK (product_type IN ('landing', 'ecommerce'));
