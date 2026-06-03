import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";

export const metadata: Metadata = { title: "Terms of Service" };

// PLACEHOLDER COPY — edit freely. Replace bracketed bits with your details.
export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 3, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of Aiselling and the digital products sold through it. By creating an
        account or making a purchase, you agree to these Terms.
      </p>

      <h2>1. Accounts</h2>
      <p>
        You are responsible for the activity on your account and for keeping
        your login secure. You must provide accurate information and be at least
        the age of majority in your jurisdiction.
      </p>

      <h2>2. Digital products &amp; license</h2>
      <p>
        Purchases grant you a non-exclusive, non-transferable license to use the
        product for your personal or internal business use. Unless stated
        otherwise on the product page, you may not resell, redistribute, or
        sublicense the files.
      </p>

      <h2>3. Payments</h2>
      <p>
        Payments are processed by our merchant of record, who handles billing,
        taxes, and receipts. Prices are shown in USD and may change over time.
      </p>

      <h2>4. Refunds</h2>
      <p>
        Refunds are handled under our <a href="/refund-policy">Refund Policy</a>
        .
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>Do not use the products for unlawful purposes.</li>
        <li>Do not attempt to disrupt or reverse-engineer the platform.</li>
        <li>Respect the intellectual property of creators.</li>
      </ul>

      <h2>6. Disclaimer &amp; liability</h2>
      <p>
        Products are provided &quot;as is&quot; without warranties of any kind.
        To the maximum extent permitted by law, Aiselling is not liable for
        indirect or consequential damages arising from use of the products.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:[support@yourdomain.com]">[support@yourdomain.com]</a>.
      </p>
    </LegalLayout>
  );
}
