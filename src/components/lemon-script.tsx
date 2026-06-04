"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (opts: {
        eventHandler: (event: { event: string }) => void;
      }) => void;
      Url: { Open: (url: string) => void; Close: () => void };
    };
  }
}

/**
 * Loads Lemon Squeezy's lemon.js (the checkout overlay) and wires a success
 * handler that drops the buyer into their library. Mounted once in the site
 * shell so any Buy button can open the overlay.
 */
export function LemonScript() {
  const router = useRouter();

  return (
    <Script
      src="https://app.lemonsqueezy.com/js/lemon.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.createLemonSqueezy?.();
        window.LemonSqueezy?.Setup({
          eventHandler: (event) => {
            if (event.event === "Checkout.Success") {
              window.LemonSqueezy?.Url.Close();
              // Webhook grants the entitlement; ?purchased=1 shows a hint.
              router.push("/dashboard?purchased=1");
              router.refresh();
            }
          },
        });
      }}
    />
  );
}
