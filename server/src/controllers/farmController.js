import { FarmSchema } from '../validations/farmValidation.js';
import { supabaseAdmin } from '../lib/supabaseClient.js';

/**
 * POST /api/farms
 * Creates a new farm profile for the authenticated user.
 */
export async function createFarm(req, res) {
  try {
    // 1. Zod schema validation
    const validatedData = FarmSchema.parse(req.body);

    // 2. Insert into Supabase with verified user_id from JWT
    const { data, error } = await supabaseAdmin
      .from('farms')
      .insert([
        {
          user_id: req.user.id, // Strictly from JWT
          plot_name: validatedData.plot_name,
          acreage: validatedData.acreage,
          climate_zone: validatedData.climate_zone,
          soil_type: validatedData.soil_type,
          soil_ph: validatedData.soil_ph,
          nitrogen_level: validatedData.nitrogen_level,
          phosphorus_level: validatedData.phosphorus_level,
          potassium_level: validatedData.potassium_level
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[-] Supabase insert farm error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Farm plot registered successfully',
      farm: data
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    console.error('[-] createFarm error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * GET /api/farms
 * Retrieves all registered farm plots for the authenticated user.
 */
export async function getFarms(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farms')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[-] Supabase fetch farms error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      farms: data || []
    });
  } catch (err) {
    console.error('[-] getFarms error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * GET /api/farms/:id
 * Retrieves a specific farm plot by ID for the authenticated user.
 */
export async function getFarmById(req, res) {
  try {
    const { id } = req.params;

    const { data: farm, error } = await supabaseAdmin
      .from('farms')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !farm) {
      return res.status(404).json({
        success: false,
        error: 'Farm plot not found or unauthorized'
      });
    }

    // Also fetch recent advisories for this specific farm
    const { data: advisories } = await supabaseAdmin
      .from('advisories')
      .select('id, advisory_type, user_observations, ai_response, created_at')
      .eq('farm_id', id)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      farm: {
        ...farm,
        advisories: advisories || []
      }
    });
  } catch (err) {
    console.error('[-] getFarmById error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
