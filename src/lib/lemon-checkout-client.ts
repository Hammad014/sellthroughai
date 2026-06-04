import { toast } from "sonner";
import { startCheckout } from "@/lib/actions/checkout";

/**
 * Client helper: start a Lemon Squeezy checkout for a product and open the
 * overlay (falling back to a full-page redirect). Shared by the product Buy
 * button and the cart. Returns true if a checkout was opened.
 */
export async function openLemonCheckout(productId: string): Promise<boolean> {
  const res = await startCheckout(productId);
  if (res.error || !res.url) {
    toast.error(res.error ?? "Could not start checkout.");
    return false;
  }
  if (typeof window !== "undefined" && window.LemonSqueezy?.Url?.Open) {
    window.LemonSqueezy.Url.Open(res.url);
  } else {
    window.location.href = res.url;
  }
  return true;
}
