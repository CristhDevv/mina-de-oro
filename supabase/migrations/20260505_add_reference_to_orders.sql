-- Add reference column to public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reference TEXT UNIQUE;
