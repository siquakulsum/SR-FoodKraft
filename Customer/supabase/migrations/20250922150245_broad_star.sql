/*
  # Customer Rating System

  1. New Tables
    - `menu_item_ratings`
      - `id` (uuid, primary key)
      - `menu_item_id` (uuid, references menu_items)
      - `user_id` (uuid, references user_profiles)
      - `rating` (integer, 1-5 stars)
      - `review` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `menu_item_stats`
      - `menu_item_id` (uuid, references menu_items, primary key)
      - `average_rating` (decimal)
      - `total_ratings` (integer)
      - `rating_distribution` (jsonb)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only create/update their own ratings
    - Public read access for ratings and stats
    - Triggers to update stats automatically
*/

-- Create menu item ratings table
CREATE TABLE IF NOT EXISTS menu_item_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(menu_item_id, user_id)
);

-- Create menu item stats table
CREATE TABLE IF NOT EXISTS menu_item_stats (
  menu_item_id uuid PRIMARY KEY REFERENCES menu_items(id) ON DELETE CASCADE,
  average_rating decimal(3,2) DEFAULT 0,
  total_ratings integer DEFAULT 0,
  rating_distribution jsonb DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_item_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_stats ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Anyone can read ratings"
  ON menu_item_ratings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON menu_item_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ratings"
  ON menu_item_ratings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own ratings"
  ON menu_item_ratings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Stats policies
CREATE POLICY "Anyone can read stats"
  ON menu_item_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_menu_item_ratings_menu_item_id ON menu_item_ratings(menu_item_id);
CREATE INDEX idx_menu_item_ratings_user_id ON menu_item_ratings(user_id);
CREATE INDEX idx_menu_item_ratings_rating ON menu_item_ratings(rating);
CREATE INDEX idx_menu_item_stats_average_rating ON menu_item_stats(average_rating DESC);

-- Create updated_at trigger for ratings
CREATE TRIGGER update_menu_item_ratings_updated_at
  BEFORE UPDATE ON menu_item_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update menu item stats
CREATE OR REPLACE FUNCTION update_menu_item_stats()
RETURNS TRIGGER AS $$
DECLARE
  item_id uuid;
  avg_rating decimal(3,2);
  total_count integer;
  rating_dist jsonb;
BEGIN
  -- Get the menu item id from the affected row
  IF TG_OP = 'DELETE' THEN
    item_id := OLD.menu_item_id;
  ELSE
    item_id := NEW.menu_item_id;
  END IF;

  -- Calculate new statistics
  SELECT 
    COALESCE(AVG(rating), 0)::decimal(3,2),
    COUNT(*),
    jsonb_build_object(
      '1', COUNT(*) FILTER (WHERE rating = 1),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '5', COUNT(*) FILTER (WHERE rating = 5)
    )
  INTO avg_rating, total_count, rating_dist
  FROM menu_item_ratings
  WHERE menu_item_id = item_id;

  -- Update or insert stats
  INSERT INTO menu_item_stats (menu_item_id, average_rating, total_ratings, rating_distribution, updated_at)
  VALUES (item_id, avg_rating, total_count, rating_dist, now())
  ON CONFLICT (menu_item_id)
  DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_ratings = EXCLUDED.total_ratings,
    rating_distribution = EXCLUDED.rating_distribution,
    updated_at = EXCLUDED.updated_at;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update stats
CREATE TRIGGER update_stats_on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON menu_item_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_item_stats();

-- Initialize stats for existing menu items
INSERT INTO menu_item_stats (menu_item_id)
SELECT id FROM menu_items
ON CONFLICT (menu_item_id) DO NOTHING;