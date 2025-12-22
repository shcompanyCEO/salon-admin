'use server';

interface InviteStaffParams {
  email: string;
  name: string;
  role: string;
  accessToken: string;
}

export async function inviteStaff({
  email,
  name,
  role,
  accessToken,
}: InviteStaffParams) {
  if (!accessToken) {
    return { error: 'You must be logged in to invite staff.' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-staff`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email,
          name,
          role,
          permissions: {}, // Default permissions
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Failed to invite staff' };
    }

    return { success: true, message: 'Invitation sent successfully!' };
  } catch (err: any) {
    return { error: err.message };
  }
}
