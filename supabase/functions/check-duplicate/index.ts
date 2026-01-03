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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, value } = await req.json();

    if (!type || !value) {
      throw new Error('Type and Value are required');
    }

    if (type === 'email') {
      // Check users table (owned by auth, but checking public users table first for safety)
      // Actually strictly we should check auth.users via admin api usually, but checking 'users' table is good enough proxy if we sync well.
      // Let's check 'users' table as it is the public profile.
      const { data } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', value)
        .maybeSingle();

      if (data) {
        return new Response(
          JSON.stringify({
            available: false,
            message: '이미 가입된 이메일입니다.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    } else if (type === 'shopName') {
      // Validate regex first
      const shopNameRegex = /^[a-zA-Z0-9_가-힣]+$/;
      if (!shopNameRegex.test(value)) {
        return new Response(
          JSON.stringify({
            available: false,
            message: '한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      const { data } = await supabaseAdmin
        .from('salons')
        .select('id')
        .eq('name', value)
        .maybeSingle();

      if (data) {
        return new Response(
          JSON.stringify({
            available: false,
            message: '이미 사용 중인 매장 이름입니다.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    } else {
      throw new Error('Invalid type');
    }

    return new Response(
      JSON.stringify({ available: true, message: '사용 가능합니다.' }),
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
