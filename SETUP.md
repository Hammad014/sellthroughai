# Aiselling — Setup & Deployment

Exact, ordered steps to take this from a fresh clone to a live Vercel
deployment. Payments (Lemon Squeezy) are **not** part of this — there's a clean
seam for them in a later session.

---

## 0. Prerequisites

- Node.js 20+ and npm
- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account
- (Optional) A Google Cloud project for Google sign-in

Install dependencies:

```bash
npm install
```

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Pick an org, name it (e.g. `aiselling`), set a strong **database password**,
   choose a region close to your users, and create it.
3. Wait ~2 minutes for it to finish provisioning.

---

## 2. Run the database migration (and seed)

1. In the Supabase dashboard, open **SQL Editor** → **New query**.
2. Open `supabase/migrations/0001_init.sql` from this repo, copy its entire
   contents into the editor, and click **Run**. This creates all tables, RLS
   policies, the `is_admin()` helper, and the trigger that auto-creates a
   profile on first sign-in.
3. (Optional, recommended) Open `supabase/seed.sql`, paste it into a new query,
   and **Run** it to insert 3 published demo products.

> Using the Supabase CLI instead? `supabase link` to your project, then
> `supabase db push`. `supabase db reset` will also auto-run `seed.sql`.

---

## 3. Create the storage buckets

Open **Storage** in the dashboard and create **two** buckets:

1. **`product-files`** — click **New bucket**, name it exactly `product-files`,
   and leave **Public** toggled **OFF**. This is the private bucket for gated
   downloadables. Do **not** add any policies — gated files are served only by
   trusted server code using the service-role key (via short-lived signed URLs).

2. **`product-covers`** — **New bucket**, name it exactly `product-covers`, and
   toggle **Public ON**. Cover images appear on the public catalog, so they're
   served from public URLs.

> Why two buckets? The brief asked for one private `product-files` bucket (done).
> Cover images are inherently public, so they live in a separate public bucket
> rather than being exposed through expiring signed URLs. If you'd rather not
> upload covers, the catalog falls back to per-category gradient art.

---

## 4. Configure authentication

### Email magic link

1. **Authentication → Providers → Email**: ensure **Enable Email provider** is
   on. (Magic links work out of the box; no password needed.)

### Google OAuth

1. In **Google Cloud Console** → **APIs & Services → Credentials**, create an
   **OAuth client ID** (type: Web application).
2. Under **Authorized redirect URIs**, add:
   `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client secret**.
4. In Supabase: **Authentication → Providers → Google**, enable it and paste the
   Client ID + secret. Save.

### Redirect / Site URLs

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` for local dev (update to your real
  domain after deploying).
- **Redirect URLs**: add both
  - `http://localhost:3000/**`
  - `https://<your-vercel-domain>/**` (add after step 7)

---

## 5. Get your environment variables

In Supabase, go to **Project Settings → API** (and **API Keys**):

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 6. Run locally & create an admin

```bash
npm run dev
```

1. Visit <http://localhost:3000>, click **Log in**, and sign in (magic link or
   Google). This creates your `auth.users` row and, via the trigger, your
   `profiles` row with `role = 'user'`.
2. Promote yourself to admin: in Supabase **SQL Editor**, run (use your email):

   ```sql
   update public.profiles set role = 'admin'
   where email = 'you@example.com';
   ```

3. Reload the app — you'll now see **Admin** in your account menu, and
   `/admin` is reachable. Non-admins are redirected away server-side.

Useful checks:

- `/products` lists the seeded products; `/products/<slug>` shows detail with a
  no-op **Buy** button.
- `/admin/products` lets you create/edit products, upload a cover, and upload
  gated files to the private bucket.

---

## 7. Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel: **Add New → Project**, import the repo. Framework preset is
   detected as **Next.js**; leave build command (`next build`) and output as
   defaults.
3. **Environment Variables** — add all four for the **Production** (and
   Preview) environments:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your Vercel URL, e.g. `https://aiselling.vercel.app`
4. Click **Deploy**.

### After the first deploy

- Back in Supabase **Authentication → URL Configuration**, set **Site URL** to
  your Vercel domain and add `https://<your-vercel-domain>/**` to **Redirect
  URLs**.
- In **Google Cloud Console**, the Supabase callback URL stays the same
  (`https://<ref>.supabase.co/auth/v1/callback`) — no change needed.
- Update `NEXT_PUBLIC_SITE_URL` in Vercel to the production domain and redeploy
  if it changed.

---

## 8. What's intentionally deferred

- **Payments (Lemon Squeezy, Merchant of Record).** The `Buy` button is a
  no-op placeholder (`src/components/buy-button.tsx`). The schema already has
  `orders`, `order_items`, `entitlements`, `download_events`, and
  `products.ls_variant_id`. `.env.example` has commented
  `LEMONSQUEEZY_*` placeholders. Wiring checkout + webhooks (grant entitlements,
  create orders) is the next session.
- **Gated download delivery.** `product_files` rows + the private bucket exist;
  generating signed URLs for entitled buyers plugs in once entitlements are
  granted by checkout.

---

## Commands

| Command            | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Start the dev server                  |
| `npm run build`    | Production build (must pass)          |
| `npm run start`    | Run the production build              |
| `npm run lint`     | ESLint                                |
| `npm run format`   | Prettier write                        |
