-- Add separate national/international diet fields to work_entries
ALTER TABLE public.work_entries
ADD COLUMN full_diets_international integer NOT NULL DEFAULT 0,
ADD COLUMN half_diets_international integer NOT NULL DEFAULT 0;

-- Rename existing fields to be explicit about national
ALTER TABLE public.work_entries
RENAME COLUMN full_diets TO full_diets_national;

ALTER TABLE public.work_entries
RENAME COLUMN half_diets TO half_diets_national;

-- Migrate existing data: if scope was international, move diets to international columns
UPDATE public.work_entries 
SET 
  full_diets_international = full_diets_national,
  half_diets_international = half_diets_national,
  full_diets_national = 0,
  half_diets_national = 0
WHERE scope = 'international';

-- Also update route_templates to have separate fields
ALTER TABLE public.route_templates
ADD COLUMN full_diets_international integer NOT NULL DEFAULT 0,
ADD COLUMN half_diets_international integer NOT NULL DEFAULT 0;

-- Rename existing fields in route_templates
ALTER TABLE public.route_templates
RENAME COLUMN full_diets TO full_diets_national;

ALTER TABLE public.route_templates
RENAME COLUMN half_diets TO half_diets_national;

-- Migrate route_templates data
UPDATE public.route_templates 
SET 
  full_diets_international = full_diets_national,
  half_diets_international = half_diets_national,
  full_diets_national = 0,
  half_diets_national = 0
WHERE scope = 'international';