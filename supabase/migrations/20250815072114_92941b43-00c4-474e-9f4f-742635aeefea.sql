-- Create market_insights table for storing market research insights
CREATE TABLE public.market_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  value TEXT NOT NULL,
  icon_type TEXT NOT NULL DEFAULT 'Brain',
  color_scheme TEXT NOT NULL DEFAULT 'from-blue-500 to-purple-600',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Create market_data table for area-specific market data
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  area_name TEXT NOT NULL,
  avg_price NUMERIC NOT NULL DEFAULT 0,
  price_change NUMERIC NOT NULL DEFAULT 0,
  total_properties INTEGER NOT NULL DEFAULT 0,
  demand_level TEXT NOT NULL DEFAULT 'Medium',
  trend TEXT NOT NULL DEFAULT 'stable',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing
CREATE POLICY "Anyone can view active market insights" 
ON public.market_insights 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view active market data" 
ON public.market_data 
FOR SELECT 
USING (is_active = true);

-- Create policies for admin management
CREATE POLICY "Admins can manage market insights" 
ON public.market_insights 
FOR ALL 
USING (is_admin_authenticated());

CREATE POLICY "Admins can manage market data" 
ON public.market_data 
FOR ALL 
USING (is_admin_authenticated());

-- Insert default market insights
INSERT INTO public.market_insights (title, description, value, icon_type, color_scheme, display_order) VALUES
('AI Price Prediction', 'Advanced algorithms analyze market trends', '95% Accuracy', 'Brain', 'from-blue-500 to-purple-600', 1),
('Real-time Analytics', 'Live data from 1000+ sources', 'Updated Hourly', 'Database', 'from-green-500 to-emerald-600', 2),
('Market Trends', 'Deep insights into emerging patterns', '12 Trending Areas', 'Search', 'from-orange-500 to-red-600', 3),
('Investment Score', 'Proprietary scoring algorithm', 'ROI up to 25%', 'Eye', 'from-purple-500 to-pink-600', 4);

-- Insert default market data
INSERT INTO public.market_data (area_name, avg_price, price_change, total_properties, demand_level, trend, display_order) VALUES
('CIDCO', 4500000, 12.5, 450, 'High', 'up', 1),
('Cantonment', 3800000, 8.2, 320, 'High', 'up', 2),
('Old City', 2200000, -2.1, 280, 'Medium', 'down', 3),
('New City', 3200000, 15.8, 180, 'High', 'up', 4);

-- Create triggers for updated_at
CREATE TRIGGER update_market_insights_updated_at
BEFORE UPDATE ON public.market_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_data_updated_at
BEFORE UPDATE ON public.market_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();