-- Migración para agregar el campo precio_venta_punto a la tabla de productos
ALTER TABLE public.products ADD COLUMN precio_venta_punto numeric NULL;
