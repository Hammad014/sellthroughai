import { getUser } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { LemonScript } from "@/components/lemon-script";

// The nav reflects per-request auth state (cookies), so render the shell
// dynamically rather than prerendering it at build time.
export const dynamic = "force-dynamic";

/**
 * Public + account shell: sticky nav on top, footer on the bottom, with the
 * cart provider wrapping both so the nav badge and pages share cart state.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const initialItems = user ? await getCart() : [];

  return (
    <CartProvider isAuthed={Boolean(user)} initialItems={initialItems}>
      <SiteNav />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      <LemonScript />
    </CartProvider>
  );
}
