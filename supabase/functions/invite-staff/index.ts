import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 1. Check if the requester is logged in
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error(
        `Unauthorized: ${userError?.message || 'User not found'}`
      );
    }

    // 2. Get the request body
    const { email, role, permissions, name } = await req.json();

    if (!email || !role || !name) {
      throw new Error('Email, Role, and Name are required');
    }

    // 3. Create Supabase Service Role Client (for admin actions)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Invite User
    // We pass all necessary info in metadata so the handle_new_user trigger can populate public.users and admin_profiles
    const { data: invitedUser, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          user_type: 'ADMIN_USER',
          role: role,
          name: name,
          shop_id: user.user_metadata.shop_id, // Pass inviter's shop_id
          permissions: permissions || {},
          is_approved: true, // Auto-approve invited staff
          invited_by: user.id,
        },
      });

    if (inviteError) {
      console.error(
        'Invite Error Object:',
        JSON.stringify(inviteError, null, 2)
      );
      throw new Error(
        `Invite failed: ${inviteError.message} (Code: ${
          inviteError.code || 'unknown'
        })`
      );
    }

    if (!invitedUser.user) {
      throw new Error('Failed to create user');
    }

    // No need to manually insert into 'users' or 'admin_profiles' as the trigger 'handle_new_user' does it now.

    return new Response(
      JSON.stringify({
        message: 'User invited successfully',
        user: invitedUser.user,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
