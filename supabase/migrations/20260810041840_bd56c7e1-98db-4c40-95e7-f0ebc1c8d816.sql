-- ROLES
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active categories" ON public.categories FOR SELECT TO anon, authenticated USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  images text[] NOT NULL DEFAULT '{}',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  inventory integer NOT NULL DEFAULT 0 CHECK (inventory >= 0),
  status text NOT NULL DEFAULT 'active',
  featured boolean NOT NULL DEFAULT false,
  sales_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX products_category_idx ON public.products(category_id);

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('ORD-' || upper(substr(md5(random()::text), 1, 8))),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  customer jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED
INSERT INTO public.categories (name, slug, description, image) VALUES
('Footwear', 'footwear', 'Everyday shoes made from soft, breathable natural materials.', '/images/cat-footwear.jpg'),
('Apparel', 'apparel', 'Easy layers in merino, organic cotton and recycled knits.', '/images/cat-apparel.jpg'),
('Accessories', 'accessories', 'Bags, socks and small goods that finish the outfit.', '/images/cat-accessories.jpg'),
('Home', 'home', 'Calm textures and warm light for the rooms you live in.', '/images/cat-home.jpg');

INSERT INTO public.products (name, slug, description, price_cents, images, category_id, tags, inventory, featured, sales_count) VALUES
('Wool Everyday Runner', 'wool-everyday-runner', 'A featherlight runner knit from ZQ-certified merino wool with a sugarcane foam sole. Breathable, machine washable and built for all-day city miles.', 11800, ARRAY['/images/wool-runner.jpg'], (SELECT id FROM public.categories WHERE slug='footwear'), ARRAY['Wool','Running','Everyday','Footwear','Unisex'], 24, true, 320),
('Canvas Low Sneaker', 'canvas-low-sneaker', 'A clean organic-cotton canvas low top with a natural rubber outsole and a soft cork footbed that molds to your step.', 9500, ARRAY['/images/canvas-sneaker.jpg'], (SELECT id FROM public.categories WHERE slug='footwear'), ARRAY['Canvas','Sneaker','Casual','Footwear'], 18, true, 210),
('Trail Hiker', 'trail-hiker', 'Grippy lugged outsole, water-repellent wool upper and a padded collar for weekends that start on pavement and end on dirt.', 14500, ARRAY['/images/trail-shoe.jpg'], (SELECT id FROM public.categories WHERE slug='footwear'), ARRAY['Trail','Outdoor','Hiking','Footwear'], 3, false, 96),
('Slip-On Lounger', 'slip-on-lounger', 'No laces, no fuss. A soft wool slip-on for airports, school runs and the walk to the coffee shop.', 10200, ARRAY['/images/slip-on.jpg'], (SELECT id FROM public.categories WHERE slug='footwear'), ARRAY['Slip-on','Wool','Comfort','Footwear'], 0, false, 140),
('Merino Crew Sweater', 'merino-crew-sweater', 'A mid-weight merino crew that breathes in the office and holds warmth on the walk home. Fully fashioned, low-waste knit.', 12800, ARRAY['/images/knit-sweater.jpg'], (SELECT id FROM public.categories WHERE slug='apparel'), ARRAY['Merino','Sweater','Layering','Apparel'], 15, true, 175),
('Organic Cotton Tee', 'organic-cotton-tee', 'The house tee. Heavyweight organic cotton, boxy but not baggy, garment-dyed in small batches.', 4200, ARRAY['/images/tee.jpg'], (SELECT id FROM public.categories WHERE slug='apparel'), ARRAY['Cotton','Tee','Basics','Apparel'], 60, false, 410),
('Quilted Field Jacket', 'quilted-field-jacket', 'A recycled-shell field jacket with a light quilted lining. Four pockets, two-way zip, made to be lived in.', 21500, ARRAY['/images/jacket.jpg'], (SELECT id FROM public.categories WHERE slug='apparel'), ARRAY['Jacket','Outerwear','Recycled','Apparel'], 8, true, 88),
('Everyday Canvas Tote', 'everyday-canvas-tote', 'A structured 16oz canvas tote with a leather-free base and an interior sleeve for a 14" laptop.', 5800, ARRAY['/images/tote.jpg'], (SELECT id FROM public.categories WHERE slug='accessories'), ARRAY['Tote','Bag','Canvas','Accessories'], 32, false, 260),
('Merino Crew Socks (3-Pack)', 'merino-crew-socks', 'Cushioned merino crew socks with a flat toe seam and arch support. Sold in a three pack of natural tones.', 2800, ARRAY['/images/socks.jpg'], (SELECT id FROM public.categories WHERE slug='accessories'), ARRAY['Socks','Merino','Basics','Accessories'], 2, false, 305),
('Washed Cotton Cap', 'washed-cotton-cap', 'A soft six-panel cap in washed cotton twill with a brass slider and an unstructured crown.', 3600, ARRAY['/images/cap.jpg'], (SELECT id FROM public.categories WHERE slug='accessories'), ARRAY['Cap','Hat','Cotton','Accessories'], 21, false, 120),
('Wool Throw Blanket', 'wool-throw-blanket', 'A generously sized lambswool throw woven on traditional looms, with a hand-knotted fringe.', 16500, ARRAY['/images/throw-blanket.jpg'], (SELECT id FROM public.categories WHERE slug='home'), ARRAY['Blanket','Wool','Home','Cozy'], 11, true, 64),
('Cedar & Clay Candle', 'cedar-clay-candle', 'Coconut-soy wax poured into a matte stoneware vessel. Cedar, dry clay and a whisper of smoke. 55 hour burn.', 4800, ARRAY['/images/candle.jpg'], (SELECT id FROM public.categories WHERE slug='home'), ARRAY['Candle','Home','Scent','Ceramic'], 40, false, 190);