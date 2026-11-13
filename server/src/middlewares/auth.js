import { supabaseAdmin, createUserClient } from '../lib/supabaseClient.js';

/**
 * Authentication Middleware:
 * Extracts Bearer token from Authorization header and verifies it with Supabase Auth via getUser(token).
 * Attaches authenticated user and a scoped client to `req.user` and `req.supabase`.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or malformed Authorization header. Expected "Bearer <token>"'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token missing'
      });
    }

    // Validate the token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token',
        detail: error?.message
      });
    }

    // Attach verified user and token
    req.user = user;
    req.token = token;
    // Client scoped to the user's token for RLS execution
    req.supabase = createUserClient(token);

    next();
  } catch (err) {
    console.error('[-] Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification failure'
    });
  }
}
