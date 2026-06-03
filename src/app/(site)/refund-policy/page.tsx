import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";

export const metadata: Metadata = { title: "Refund Policy" };

// PLACEHOLDER COPY — edit freely.
export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund Policy" updated="June 3, 2026">
      <p>
        We want you to be happy with your purchase. Because these are digital
        products with instant access, the policy below explains when refunds are
        available.
      </p>

      <h2>14-day refund window</h2>
      <p>
        You may request a refund within 14 days of purchase if the product
        didn&apos;t meet a reasonable expectation set by its description. Just
        reply to your receipt or email{" "}
        <a href="mailto:[support@yourdomain.com]">[support@yourdomain.com]</a>{" "}
        with your order number.
      </p>

      <h2>What qualifies</h2>
      <ul>
        <li>The files were corrupted or inaccessible.</li>
        <li>The product was materially not as described.</li>
        <li>You were charged in error or more than once.</li>
      </ul>

      <h2>What usually doesn&apos;t</h2>
      <ul>
        <li>
          Change of mind after extensively downloading or using the materials.
        </li>
        <li>Requests made after the 14-day window.</li>
      </ul>

      <h2>How refunds are issued</h2>
      <p>
        Approved refunds are processed by our payment merchant of record back to
        your original payment method. Access to the product may be revoked once
        a refund is issued.
      </p>
    </LegalLayout>
  );
}
