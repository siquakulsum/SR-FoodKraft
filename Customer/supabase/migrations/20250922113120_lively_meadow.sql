/*
  # Menu Items and Categories

  1. New Tables
    - `menu_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `display_order` (integer)
      - `is_active` (boolean)
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category_id` (uuid, references menu_categories)
      - `subcategory` (text, optional)
      - `image_url` (text)
      - `price_per_kg` (decimal, optional)
      - `price_per_piece` (decimal, optional)
      - `is_vegetarian` (boolean)
      - `is_available` (boolean)
      - `min_quantity` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Public read access for menu items and categories
    - Admin-only write access (for now, we'll use service role)
*/

-- Create menu categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  subcategory text,
  image_url text NOT NULL,
  price_per_kg decimal(10,2),
  price_per_piece decimal(10,2),
  is_vegetarian boolean DEFAULT true,
  is_available boolean DEFAULT true,
  min_quantity decimal(4,2) DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT price_check CHECK (
    (price_per_kg IS NOT NULL AND price_per_piece IS NULL) OR
    (price_per_kg IS NULL AND price_per_piece IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public read policies for menu
CREATE POLICY "Anyone can read menu categories"
  ON menu_categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read menu items"
  ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

-- Insert default categories
INSERT INTO menu_categories (name, description, display_order) VALUES
  ('Starters', 'Appetizers and starter dishes', 1),
  ('Main Course', 'Main course dishes and curries', 2),
  ('Rice/Biryani', 'Rice dishes and biryanis', 3),
  ('Gravies', 'Curry and gravy dishes', 4),
  ('Breads', 'Indian breads and rotis', 5),
  ('Desserts', 'Sweet dishes and desserts', 6),
  ('Beverages', 'Drinks and beverages', 7)
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger for menu_items
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();