/**
 * Brand + contact details, in one place. Override the support email per
 * environment with NEXT_PUBLIC_SUPPORT_EMAIL (e.g. once the domain is live).
 */
export const SITE_NAME = "Makeready";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@makeready.com";
