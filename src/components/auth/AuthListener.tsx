'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // If a user clicks a "reset password" or "invite" link that triggers recovery mode
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/update-password');
      }

      // Note: Regular invites might just trigger SIGNED_IN.
      // If we want to force password update for new users, we would need to check
      // a flag in the database or metadata.
      // For now, relying on PASSWORD_RECOVERY event which is standard for "Reset Password" links.
      // Ideally, the Invitation Email URL in Supabase should be configured to redirect to /update-password
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
