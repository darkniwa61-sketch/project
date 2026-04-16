-- ============================================================
-- Migration: Enable Decimals for Inventory Stock
-- ============================================================

-- Alter stock and min columns to NUMERIC to support decimals
ALTER TABLE public.inventory 
  ALTER COLUMN stock TYPE NUMERIC,
  ALTER COLUMN min TYPE NUMERIC;

-- Note: In PostgreSQL, altering a column from INTEGER to NUMERIC is usually 
-- implicit and doesn't require a 'USING' clause, but keeping it simple.
