-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category TEXT NOT NULL,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    badge TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending_payment', 'payment_uploaded', 'payment_verified', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled');

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status order_status NOT NULL DEFAULT 'pending_payment',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_zip TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    payment_screenshot_url TEXT,
    payment_verified_at TIMESTAMP WITH TIME ZONE,
    payment_verified_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_tracking table for tracking updates
CREATE TABLE public.order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    tracking_number TEXT,
    carrier TEXT,
    location TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, product_id, order_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pending orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending_payment', 'payment_uploaded'));
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_items
CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_tracking (only visible after admin approval)
CREATE POLICY "Users can view tracking for approved orders" ON public.order_tracking FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_tracking.order_id AND orders.user_id = auth.uid() AND orders.status IN ('approved', 'processing', 'shipped', 'delivered')));
CREATE POLICY "Admins can manage all tracking" ON public.order_tracking FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their orders" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.user_id = auth.uid() AND orders.status = 'delivered'));
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', false);

-- Storage policies for payment screenshots
CREATE POLICY "Users can upload payment screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, category, image_url, badge, rating, review_count, featured) VALUES
('Romantic Explosion Box', 'A beautiful handmade explosion box perfect for anniversaries and special occasions. Opens to reveal multiple layers of photos and messages.', 1299.00, 1599.00, 'explosion-boxes', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400', 'Bestseller', 4.8, 124, true),
('Classic Pyramid Album', 'Elegant pyramid-shaped photo album with intricate paper craft details. Perfect for preserving precious memories.', 899.00, NULL, 'pyramid-albums', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'New', 4.6, 89, true),
('Floral Greeting Card Set', 'Set of 6 handcrafted greeting cards with pressed flower designs. Each card is unique and made with love.', 299.00, 399.00, 'greeting-cards', 'https://images.unsplash.com/photo-1606722590389-12c8d3cd9bf2?w=400', 'Sale', 4.9, 256, true),
('Anniversary Memory Album', 'Premium handbound album designed to celebrate years of togetherness. Features custom covers and archival-quality pages.', 1899.00, NULL, 'anniversary-albums', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', NULL, 4.7, 67, true),
('Birthday Pop-up Card', 'Colorful 3D pop-up birthday card that springs to life when opened. A delightful surprise for any birthday celebration.', 199.00, NULL, 'birthday-cards', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400', 'New', 4.5, 145, false),
('3D Paper Art Album', 'Stunning 3D paper sculpture album featuring layered designs and intricate cutwork. A true work of art.', 2199.00, 2499.00, '3d-albums', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 'Premium', 4.9, 34, true),
('Mini Accordion Album', 'Compact accordion-style mini album perfect for carrying memories everywhere. Fits in your pocket or purse.', 499.00, NULL, 'mini-albums', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', NULL, 4.4, 198, false),
('Vintage Scrapbook Album', 'Beautifully crafted vintage-style scrapbook with distressed edges and antique embellishments.', 1599.00, NULL, 'handmade-albums', 'https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=400', 'Bestseller', 4.8, 87, true);