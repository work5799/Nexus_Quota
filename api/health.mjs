// Simple health check for Vercel deployment
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check Supabase connection
    const { data: testData, error: testError } = await supabase.from('users').select('id', { count: 'exact', head: true });

    res.status(200).json({
      status: 'ok',
      message: 'Health check passed!',
      supabase_connected: !testError,
      supabase_error: testError?.message,
      env_has_supabase_url: !!process.env.SUPABASE_URL,
      env_has_supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      env_has_jwt_secret: !!process.env.JWT_SECRET
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
}