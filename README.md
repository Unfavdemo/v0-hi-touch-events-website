# Hi Touch Events — Website

Marketing site for Hi Touch Events, built with [Next.js](https://nextjs.org), React, and Tailwind CSS.

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production server
- `npm run lint` — run ESLint
- `npm run db:network:setup` — migrate + seed the Solutions member-network DB

## Member network test subdomain

HiTouch Solutions **admin** and **vendor** portals are mounted under `/network/*` for client testing on the `test.` subdomain.

See **[docs/NETWORK-TEST.md](docs/NETWORK-TEST.md)** for env vars, demo logins, local `test.localhost` setup, and Vercel domain steps.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

Copy [`.env.example`](.env.example) to `.env` (or `.env.local`) and fill in values when you add integrations (see comments in the example file).
