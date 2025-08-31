-- Add new columns to market_data table for different analysis types
ALTER TABLE public.market_data 
ADD COLUMN growth_rate numeric DEFAULT 0,
ADD COLUMN roi_percentage numeric DEFAULT 0, 
ADD COLUMN demand_score numeric DEFAULT 0,
ADD COLUMN price_trend_direction text DEFAULT 'stable',
ADD COLUMN growth_trend text DEFAULT 'stable',
ADD COLUMN roi_trend text DEFAULT 'stable',
ADD COLUMN demand_trend text DEFAULT 'stable';

-- Add some sample data to existing records so they show up in different analysis types
UPDATE public.market_data 
SET 
  growth_rate = CASE 
    WHEN area_name LIKE '%Waluj%' THEN 12.5
    WHEN area_name LIKE '%Aurangabad%' THEN 8.3
    WHEN area_name LIKE '%CIDCO%' THEN 15.2
    ELSE 6.8
  END,
  roi_percentage = CASE 
    WHEN area_name LIKE '%Waluj%' THEN 9.2
    WHEN area_name LIKE '%Aurangabad%' THEN 7.8
    WHEN area_name LIKE '%CIDCO%' THEN 11.5
    ELSE 5.9
  END,
  demand_score = CASE 
    WHEN demand_level = 'High' THEN RANDOM() * 30 + 70
    WHEN demand_level = 'Medium' THEN RANDOM() * 30 + 40
    ELSE RANDOM() * 30 + 10
  END,
  price_trend_direction = trend,
  growth_trend = CASE 
    WHEN RANDOM() > 0.7 THEN 'up'
    WHEN RANDOM() > 0.3 THEN 'stable' 
    ELSE 'down'
  END,
  roi_trend = CASE 
    WHEN RANDOM() > 0.6 THEN 'up'
    WHEN RANDOM() > 0.4 THEN 'stable'
    ELSE 'down' 
  END,
  demand_trend = CASE 
    WHEN demand_level = 'High' THEN 'up'
    WHEN demand_level = 'Low' THEN 'down'
    ELSE 'stable'
  END;