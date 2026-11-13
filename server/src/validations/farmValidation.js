import { z } from 'zod';

export const FarmSchema = z.object({
  plot_name: z.string().min(1, 'Plot name is required'),
  acreage: z.number({ invalid_type_error: 'Acreage must be a number' }).positive('Acreage must be greater than zero'),
  climate_zone: z.enum(['Tropical', 'Arid', 'Temperate', 'Continental'], {
    errorMap: () => ({ message: 'Climate zone must be Tropical, Arid, Temperate, or Continental' })
  }),
  soil_type: z.enum(['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat'], {
    errorMap: () => ({ message: 'Soil type must be Clay, Sandy, Loamy, Silt, or Peat' })
  }),
  soil_ph: z.number().min(1, 'Soil pH must be between 1 and 14').max(14, 'Soil pH must be between 1 and 14'),
  nitrogen_level: z.enum(['Low', 'Medium', 'High']),
  phosphorus_level: z.enum(['Low', 'Medium', 'High']),
  potassium_level: z.enum(['Low', 'Medium', 'High'])
});

export const AdvisoryRequestSchema = z.object({
  farm_id: z.string().uuid('Valid farm ID (UUID) is required'),
  advisory_type: z.enum(['Crop Selection', 'Pest Management'], {
    errorMap: () => ({ message: 'Advisory type must be Crop Selection or Pest Management' })
  }),
  current_season: z.enum(['Spring', 'Summer', 'Autumn', 'Winter'], {
    errorMap: () => ({ message: 'Current season must be Spring, Summer, Autumn, or Winter' })
  }),
  user_observations: z.string().optional().default('')
});
