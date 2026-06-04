# Payments & Delivery (Lemon Squeezy)

How checkout, fulfilment, and gated delivery work — and exactly how to
configure, test, and verify them end to end.

## How it fits together

```
Buy button ──▶ startCheckout() server action ──▶ LS createCheckout
   (overlay)        passes email + user_id + product_id as custom data
        │
        ▼
Lemon Squeezy hosted checkout (MoR handles card, tax, receipt)
        │  on payment
        ▼
POST /api/webhooks/lemonsqueezy   (verify HMAC, idempotent)
        │   • upsert order by ls_order_id
        │   • guest → create auth user + profile
        │   • insert order_items, grant entitlement
        ▼
/dashboard  (library reads entitlements)
   • license → Lemon Squeezy receipt/download link
   • gated   → /dashboard/courses/[slug] (lessons + signed-URL video)
                downloads go through /api/download (60s signed URL)
```

`delivery_type` decides delivery:

- **`license`** → fulfilled by Lemon Squeezy (their hosted download / license
  keys). The library shows the order's receipt link.
- **`gated`** → fulfilled by us from the private `product-files` bucket: the
  course player streams videos and `/api/download` serves files via 60-second
  signed URLs.

---

## 1. Lemon Squeezy setup

1. Create a **Lemon Squeezy** account and a **Store**.
2. Toggle **Test mode** (top bar) while developing — use test cards, no real
   charges.
3. Create a **Product** and at least one **Variant** for each thing you sell
   (single-payment / one-time pricing).
4. Note each **Variant ID**: open the variant → the ID is in the URL / share
   link (a number like `123456`).
5. **Settings → API** → create an **API key**. Copy it.
6. **Settings → Stores** → copy your **Store ID** (a number).

### Map variants to your products

In your app's admin (`/admin/products` → edit a product), paste the variant ID
into **Lemon Squeezy variant ID** and **Publish** the product. Checkout is
disabled until a product has a variant ID.

---

## 2. Environment variables

Add to `.env.local` (and to Vercel for Production/Preview):

```env
LEMONSQUEEZY_API_KEY=ls_xxx...
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=your-signing-secret   # from step 3
LEMONSQUEEZY_TEST_MODE=true                        # true while testing
NEXT_PUBLIC_SITE_URL=http://localhost:3000         # your URL (no trailing slash)
```

Also run the additive migration once (Supabase SQL Editor):
`supabase/migrations/0002_payments.sql` (adds `orders.receipt_url`).

---

## 3. Configure the webhook

The webhook endpoint is **`/api/webhooks/lemonsqueezy`**.

- **Production:** in Lemon Squeezy **Settings → Webhooks → +**, set the URL to
  `https://<your-domain>/api/webhooks/lemonsqueezy`, choose a **signing secret**
  (put the same value in `LEMONSQUEEZY_WEBHOOK_SECRET`), and subscribe to the
  **`order_created`** event. Save.
- **Local dev:** Lemon Squeezy can't reach `localhost`, so expose it with a
  tunnel:
  ```bash
  npx untun@latest tunnel http://localhost:3000
  # or: cloudflared tunnel --url http://localhost:3000  /  ngrok http 3000
  ```
  Use the public tunnel URL + `/api/webhooks/lemonsqueezy` as the webhook URL.
  (Easiest alternative: deploy a Vercel Preview and point the webhook there.)

> The handler verifies the `X-Signature` HMAC-SHA256 over the raw body, so the
> secret must match exactly. A mismatch returns 401 and LS marks the delivery
> failed.

---

## 4. Test in LS test mode

1. Ensure **Test mode** is on in Lemon Squeezy and `LEMONSQUEEZY_TEST_MODE=true`.
2. Open a product page and click **Buy now** → the overlay opens.
3. Pay with a **test card**: `4242 4242 4242 4242`, any future expiry, any CVC,
   any ZIP.
4. In **Settings → Webhooks**, open the webhook and check **Recent deliveries** —
   `order_created` should show a `200`. (You can **Resend** to retry.)

---

## 5. Verify the full guest → account → library → download flow

1. **Guest checkout:** sign out. On a product page, click **Buy now** and pay
   with the test card using an email you control (e.g. `you+test@gmail.com`).
2. **Webhook fulfilment:** confirm the delivery is `200`. In Supabase, check:
   - `orders` has a row with your `ls_order_id` and `receipt_url`.
   - `order_items` has the line item.
   - `auth.users` + `profiles` now contain that email (guest → account).
   - `entitlements` has a row for `(user_id, product_id)`.
3. **Account access:** go to `/login`, request a **magic link** for the same
   email, and sign in. (The guest account was created confirmed, so the link
   just logs you in.)
4. **Library:** `/dashboard` lists the purchase.
   - **License product:** click **Download / license** → opens the Lemon
     Squeezy receipt with the downloadable file / license key.
   - **Gated product:** click **Open course** → `/dashboard/courses/[slug]`
     renders lessons (markdown) and streams any lesson videos.
5. **Gated download:** in the course player, click a resource. `/api/download`
   verifies your entitlement, mints a 60-second signed URL, logs a
   `download_events` row, and redirects to the file. The storage path is never
   exposed; opening the link without an entitlement returns 403.
6. **Idempotency:** **Resend** the webhook from Lemon Squeezy — no duplicate
   orders, items, or entitlements are created.

### Seeding a gated course for testing

For a `gated` product, open it in `/admin/products`, scroll to **Course
lessons**, and add a lesson (title + markdown, optional video). Buyers see it in
the course player.

---

## Security notes

- **Admin** is reachable only by users whose `profiles.role = 'admin'` — set
  exclusively in Supabase (SQL). `requireAdmin()` checks this server-side in the
  `/admin` layout; there is no in-app way to self-promote.
- Gated files/videos live in the **private** `product-files` bucket and are only
  ever delivered as short-lived signed URLs after an entitlement check.
- The webhook trusts only **signature-verified** payloads; product/user
  resolution prefers our own `custom_data` (`product_id`, `user_id`).
