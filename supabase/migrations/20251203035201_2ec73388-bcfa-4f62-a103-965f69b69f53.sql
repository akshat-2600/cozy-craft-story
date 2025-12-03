-- Fix orders policies - make them PERMISSIVE instead of RESTRICTIVE
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders" ON public.orders
FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending_payment', 'payment_uploaded'));

CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders" ON public.orders
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Fix order_items policies
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Users can create order items" ON public.order_items
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can view their order items" ON public.order_items
FOR SELECT USING (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Admins can view all order items" ON public.order_items
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));