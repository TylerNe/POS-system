-- Add decrement_stock RPC function for atomic stock updates
-- Run this in Supabase SQL Editor after the main schema

CREATE OR REPLACE FUNCTION public.decrement_stock(p_id UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - qty,
      updated_at = NOW()
  WHERE id = p_id AND stock >= qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock or product not found for id %', p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (called server-side with service_role anyway)
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO service_role;
