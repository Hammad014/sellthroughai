import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";

export const metadata: Metadata = { title: "Privacy Policy" };

// PLACEHOLDER COPY — edit freely.
export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 3, 2026">
      <p>
        This Privacy Policy explains what information Aiselling collects, how we
        use it, and the choices you have. We aim to collect only what we need to
        run the store and deliver your purchases.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — your email and, optionally, your name.
        </li>
        <li>
          <strong>Order data</strong> — what you purchased and when (billing
          details are held by our payment processor, not by us).
        </li>
        <li>
          <strong>Usage data</strong> — basic logs and download events used to
          deliver files and prevent abuse.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        To create your account, deliver products, provide support, and improve
        the service. We do not sell your personal data.
      </p>

      <h2>Service providers</h2>
      <p>
        We use trusted processors — including Supabase (database &amp; auth) and
        our payment merchant of record — who process data on our behalf under
        their own terms.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request access to or deletion of your personal data by emailing{" "}
        <a href="mailto:[privacy@yourdomain.com]">[privacy@yourdomain.com]</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies to keep you signed in. We do not use them for
        cross-site advertising.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:[privacy@yourdomain.com]">[privacy@yourdomain.com]</a>.
      </p>
    </LegalLayout>
  );
}
