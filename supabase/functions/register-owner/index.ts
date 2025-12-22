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
    // 1. Get the request body
    const { email, password, name, shopName, phone } = await req.json();

    if (!email || !password || !name || !shopName || !phone) {
      throw new Error(
        'Email, Password, Name, Shop Name, and Phone are required'
      );
    }

    // 2. Create Supabase Service Role Client (for admin actions)
    // We need service role to create users without them confirming email immediately (optional)
    // and to insert into tables bypassing RLS if needed (though RLS usually allows inserts)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1.4 Validate Format
    const shopNameRegex = /^[a-zA-Z0-9_가-힣]+$/;
    if (!shopNameRegex.test(shopName)) {
      throw new Error(
        '매장 이름은 한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다 (띄어쓰기, 하이픈 불가)'
      );
    }

    // 1.5 Validate Duplicates
    // Check Shop Name
    const { data: existingShop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('name', shopName)
      .maybeSingle();

    if (existingShop) {
      throw new Error('이미 사용 중인 매장 이름입니다.');
    }

    // Check Phone (in shops table)
    const { data: existingPhoneShop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingPhoneShop) {
      throw new Error('이미 등록된 매장 전화번호입니다.');
    }

    // Check Phone (in users table - optional but good for ensuring unique owner contact)
    const { data: existingPhoneUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingPhoneUser) {
      throw new Error('이미 가입된 휴대폰 번호입니다.');
    }

    // Check Email (in users table - strictly check for existing owner profiles)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('이미 가입된 이메일입니다.');
    }

    // 3. Create Auth User (Auto-Verified)
    // We set email_confirm: true to bypass email verification entirely.
    // The user can login immediately. If manual approval is needed, the Admin can toggle 'is_approved' later.
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        phone: phone, // Save to Auth User
        email_confirm: true, // Auto-verify email
        user_metadata: {
          name: name,
          phone: phone,
          user_type: 'ADMIN_USER',
          role: 'ADMIN',
        },
      });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create auth user');

    const userId = authData.user.id;

    // No email handling needed as we are auto-verifying.

    // 4. Create Shop
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .insert({
        name: shopName,
        email: email,
        phone: phone,
        // Provide defaults for required fields NOT provided in UI
        address: '',
        city: '',
        country: '', // Defaulting to KR for Korean UI context
      })
      .select('id')
      .single();

    if (shopError) {
      // Rollback auth user creation
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw shopError;
    }

    const shopId = shopData.id;

    // 5. Update User with Shop ID (Trigger already created the row)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        shop_id: shopId,
        is_active: true,
        is_approved: false,
        phone: phone, // Save to Public User Profile
        // user_type and role were set by trigger based on metadata
      })
      .eq('id', userId);

    if (userError) {
      // Rollback
      await supabaseAdmin.from('shops').delete().eq('id', shopId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw userError;
    }

    // 6. Update Admin Profile Permissions (Trigger already created the row with defaults)
    // We want to give Owners full access
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .update({
        permissions: {
          bookings: { view: true, create: true, edit: true, delete: true },
          customers: { view: true, create: true, edit: true, delete: true },
          services: { view: true, create: true, edit: true, delete: true },
          staff: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, edit: true },
          financials: { view: true },
        },
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      // We might continue even if this fails, or strict rollback.
    }

    // 7. Email is sent automatically by Supabase (via Dashboard SMTP settings)

    return new Response(
      JSON.stringify({
        message: 'Owner registered successfully (Verification email sent)',
        user: authData.user,
        shopId: shopId,
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
