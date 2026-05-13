# Princess Empire

Premium e-commerce website for Nigerian/African fashion market — clothing, shoes, perfumes, beauty, accessories, bags, lingerie, and jewellery.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/princess-empire run dev` — run the frontend (port 22613)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (wouter routing), Tailwind CSS v4, shadcn/ui, sonner toasts, recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/princess-empire/src/pages/` — all customer-facing pages (home, shop, product-detail, cart, checkout, wishlist, account)
- `artifacts/princess-empire/src/pages/admin/` — admin panel pages (login, dashboard, products, orders, categories, settings)
- `artifacts/princess-empire/src/components/` — shared components (header, footer, product-card, cart-context, wishlist-context, whatsapp-button, theme-provider)
- `artifacts/api-server/src/routes/` — API routes (auth, products, categories, orders, settings, dashboard, health)
- `lib/db/src/schema/` — DB schema (products, orders, settings, categories)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas

## Architecture decisions

- Contract-first: OpenAPI spec defines all types; never hand-write types that duplicate generated ones.
- Admin auth uses localStorage `isAdmin=true` + `adminToken` set on successful login.
- Cart + Wishlist stored in localStorage keys `pe_cart` and `pe_wishlist`.
- WhatsApp button reads phone number live from `/api/settings` so admin can change it without a redeploy.
- All currency is Nigerian Naira (₦). Images use picsum.photos with seeded IDs for consistent product images.

## Product

- **Homepage**: Rotating hero banner, trust badges, 8-category grid, new arrivals, flash sale countdown, featured & bestseller sections, brand carousel, newsletter.
- **Shop**: Full product grid with search, sort, category/price/brand/type filters, active filter chips, pagination, grid/list toggle.
- **Product Detail**: Image gallery with hover swap, size/color selectors, quantity picker, reviews tab, shipping info, related products.
- **Cart**: Item management (qty +/-, remove), free shipping threshold, coupon field, order summary.
- **Checkout**: Form validation with react-hook-form + zod, real order creation via API.
- **Wishlist**: Save/remove products, add to cart from wishlist.
- **Account**: Customer login/profile, order history (sample), wishlist view.
- **Admin** (`/admin`): Dark login page → Dashboard with stats/charts/low-stock alerts → Products CRUD → Orders with status updates → Categories → Settings (WhatsApp number, store info).

## User preferences

- Nigerian Naira (₦) for all prices.
- Dark/light mode toggle in the header.
- WhatsApp floating button must read from admin settings.
- Admin credentials: admin@princessempire.com / admin123.

## Gotchas

- After any API server code change, restart the "artifacts/api-server: API Server" workflow.
- `pnpm --filter @workspace/db run push` must be run after schema changes.
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change.
- Always use `@workspace/api-client-react` hooks — never call fetch directly in components.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
