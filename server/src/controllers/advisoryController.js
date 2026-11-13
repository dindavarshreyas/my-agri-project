import { AdvisoryRequestSchema } from '../validations/farmValidation.js';
import { supabaseAdmin } from '../lib/supabaseClient.js';
import { generateCropAdvisory } from '../services/geminiService.js';

/**
 * POST /api/advisory/generate
 * Core AI route:
 * 1. Validates input with Zod.
 * 2. Fetches farm plot metadata from Supabase (validating ownership).
 * 3. Calls Gemini 2.5 Flash with structured JSON schema.
 * 4. Saves generated advisory to `advisories` table.
 * 5. Returns the structured advisory object to client.
 */
export async function generateAdvisory(req, res) {
  try {
    // 1. Validate request payload
    const validatedData = AdvisoryRequestSchema.parse(req.body);

    // 2. Fetch farm metadata belonging to user
    const { data: farm, error: farmError } = await supabaseAdmin
      .from('farms')
      .select('*')
      .eq('id', validatedData.farm_id)
      .eq('user_id', req.user.id)
      .single();

    if (farmError || !farm) {
      return res.status(404).json({
        success: false,
        error: 'Target farm plot not found or not owned by authenticated user'
      });
    }

    // 3. Call Gemini 2.5 Flash via @google/genai
    console.log(`[*] Generating AI advisory for farm: ${farm.plot_name} (${validatedData.advisory_type})...`);
    const aiResponse = await generateCropAdvisory({
      farm,
      advisory_type: validatedData.advisory_type,
      current_season: validatedData.current_season,
      user_observations: validatedData.user_observations
    });

    // 4. Save to database
    const { data: advisoryRecord, error: insertError } = await supabaseAdmin
      .from('advisories')
      .insert([
        {
          user_id: req.user.id,
          farm_id: farm.id,
          advisory_type: validatedData.advisory_type,
          user_observations: validatedData.user_observations || '',
          ai_response: aiResponse
        }
      ])
      .select('*, farms(plot_name, climate_zone, soil_type, acreage)')
      .single();

    if (insertError) {
      console.error('[-] Error saving advisory to Supabase:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to record advisory in database',
        detail: insertError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Advisory successfully generated and recorded',
      advisory: advisoryRecord
    });

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    console.error('[-] generateAdvisory error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'AI generation failed'
    });
  }
}

/**
 * GET /api/advisories
 * Retrieves all advisories for the authenticated user, joined with farm plot details.
 */
export async function getAdvisories(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('advisories')
      .select(`
        id,
        user_id,
        farm_id,
        advisory_type,
        user_observations,
        ai_response,
        created_at,
        farms (
          id,
          plot_name,
          climate_zone,
          soil_type,
          soil_ph,
          acreage
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[-] Supabase fetch advisories error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      advisories: data || []
    });
  } catch (err) {
    console.error('[-] getAdvisories error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * GET /api/advisories/:id
 * Retrieves a specific advisory report by ID.
 */
export async function getAdvisoryById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('advisories')
      .select(`
        id,
        user_id,
        farm_id,
        advisory_type,
        user_observations,
        ai_response,
        created_at,
        farms (
          id,
          plot_name,
          acreage,
          climate_zone,
          soil_type,
          soil_ph,
          nitrogen_level,
          phosphorus_level,
          potassium_level
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Advisory report not found or unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      advisory: data
    });
  } catch (err) {
    console.error('[-] getAdvisoryById error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
