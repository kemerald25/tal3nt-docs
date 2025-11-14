const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function verifyAdminToken(idToken: string | null | undefined) {
  if (!idToken || !adminEmails.length) {
    return null;
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { email?: string };
    const email = payload.email?.toLowerCase();

    if (!email || !adminEmails.includes(email)) {
      return null;
    }

    return { email };
  } catch {
    return null;
  }
}

