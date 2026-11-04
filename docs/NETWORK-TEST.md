# HiTouch Events — Staffing

Admin + vendor portals from **HiTouch Events — Staffing** are mounted in this Events repo under `/network/*`, and are served on **`portal.hitouchevents.com`**.

## URLs

| Surface | Pretty URL (on `portal.` host) | Internal route |
| -------- | ------------------------------ | -------------- |
| Login | `https://portal.hitouchevents.com/login` | `/network/login` |
| Admin console | `https://portal.hitouchevents.com/admin` | `/network/admin` |
| Vendor portal | `https://portal.hitouchevents.com/freelancer` | `/network/freelancer` |

On the apex domain, `/network/*` is **blocked in production** unless `NETWORK_ALLOW_APEX=1`. CRM `/admin` on apex is unchanged.

## Demo accounts (after seed)

| Role | Email | Password | Lands on |
| ---- | ----- | -------- | -------- |
| Admin | `admin@hitouch.io` | `hitouch-admin-2026` | `/network/admin` |
| Vendor | `marcus.dj@example.com` | `freelancer-demo-2026` | `/network/freelancer` |

More accounts: see HiTouch Events — Staffing `TEST_CREDENTIALS.md` (same seed).

## Local setup

1. Copy env vars from `.env.example` into `.env`:
   - `NETWORK_DATABASE_URL` — separate Neon DB for Staffing
   - `NETWORK_SESSION_SECRET`
   - `NETWORK_TEST_HOST=portal.localhost`
2. Install + generate:

```bash
npm install
npm run db:network:setup   # generate + migrate + seed
```

3. Run the app and open the portal host:

```bash
npm run dev
# Visit http://portal.localhost:3000/login
# (or http://localhost:3000/network/login with NETWORK_ALLOW_APEX=1)
```

Add to `/etc/hosts` if needed:

```
127.0.0.1 portal.localhost
```

## Vercel deploy

1. Add domain **`portal.hitouchevents.com`** to this Vercel project.
2. Set env:
   - `NETWORK_DATABASE_URL`
   - `NETWORK_SESSION_SECRET`
   - `NETWORK_TEST_HOST=portal.hitouchevents.com`
   - `NETWORK_PUBLIC_URL=https://portal.hitouchevents.com`
   - Optional Stripe keys for membership checkout
3. Run migrations against the network DB (CI or one-off):

```bash
npm run db:network:migrate
npm run db:network:seed   # demo data only — avoid on a production client DB with real data
```

4. Client walkthrough:
   1. Open `https://portal.hitouchevents.com/login`
   2. Sign in as **admin** → applications, opportunities, matching, payouts, reviews
   3. Sign out → sign in as **vendor** → calendar, invites, jobs, documents, payments

## Architecture notes

- Separate Prisma schema: `prisma-network/` → client in `lib/generated/network-prisma`
- Cookie auth: `hitouch_network_session` (not NextAuth)
- Host rewrites: `lib/network/host.ts` + `proxy.ts`
- Partner portal routes remain in the tree for DB/seed integrity but redirect to `/network/unavailable` — this surface is staff + vendors only
