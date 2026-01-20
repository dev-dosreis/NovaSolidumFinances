const rawAllowlist = import.meta.env.VITE_ADMIN_EMAILS ?? '';

const adminEmails = rawAllowlist
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const hasAdminAllowlist = adminEmails.length > 0;

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return adminEmails.includes(email.trim().toLowerCase());
};
