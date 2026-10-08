# Member Network test surface (HiTouch Solutions)

Admin + vendor portals from **HiTouch Solutions** are mounted in this Events repo under `/network/*`, and are meant to be served on the **`test.` subdomain** for client demos.

## URLs

| Surface | Pretty URL (on `test.` host) | Internal route |
| -------- | ---------------------------- | -------------- |
| Login | `https://test.<apex>/login` | `/network/login` |
| Admin console | `https://test.<apex>/admin` | `/network/admin` |
| Vendor portal | `https://test.<apex>/freelancer` | `/network/freelancer` |

On the apex domain, `/network/*` is **blocked in production** unless `NETWORK_ALLOW_APEX=1`. CRM `/admin` on apex is unchanged.

## Demo accounts (after seed)

| Role | Email | Password | Lands on |
| ---- | ----- | -------- | -------- |
| Admin | `admin@hitouch.io` | `hitouch-admin-2026` | `/network/admin` |
| Vendor | `marcus.dj@example.com` | `freelancer-demo-2026` | `/network/freelancer` |

More accounts: see HiTouch Solutions `TEST_CREDENTIALS.md` (same seed).

## Local setup

1. Copy env vars from `.env.example` into `.env`:
   - `NETWORK_DATABASE_URL` — separate Neon DB (or reuse Solutions DB for local)
   - `NETWORK_SESSION_SECRET`
   - `NETWORK_TEST_HOST=test.localhost`
2. Install + generate:

```bash
npm install
npm run db:network:setup   # generate + migrate + seed
```

3. Run the app and open the test host:

```bash
npm run dev
# Visit http://test.localhost:3000/login
# (or http://localhost:3000/network/login with NETWORK_ALLOW_APEX=1)
```

Add to `/etc/hosts` if needed:

```
127.0.0.1 test.localhost
```

## Vercel deploy

1. Add domain **`test.<your-apex>`** to this Vercel project.
2. Set env:
   - `NETWORK_DATABASE_URL`
   - `NETWORK_SESSION_SECRET`
   - `NETWORK_TEST_HOST=test.<your-apex>`
   - Optional Stripe keys for membership checkout
3. Run migrations against the network DB (CI or one-off):

```bash
npm run db:network:migrate
npm run db:network:seed   # demo data only — avoid on a production client DB with real data
```

4. Client walkthrough:
   1. Open `https://test.<apex>/login`
   2. Sign in as **admin** → applications, opportunities, matching, payouts, reviews
   3. Sign out → sign in as **vendor** → calendar, invites, jobs, documents, payments

## Architecture notes

- Separate Prisma schema: `prisma-network/` → client in `lib/generated/network-prisma`
- Cookie auth: `hitouch_network_session` (not NextAuth)
- Host rewrites: `lib/network/host.ts` + `proxy.ts`
- Partner UI is included at `/network/partner` for seed integrity but is not the focus of the test demo
