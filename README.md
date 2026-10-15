# North & Loom

A portfolio-grade MERN commerce application for considered homeware. It combines a polished customer storefront with a role-protected operations dashboard backed by MongoDB Atlas.

## What is included

- Live MongoDB product catalog with categories, search, wishlist, product details, and inventory
- Persistent cart and a card-free test checkout that creates real test orders
- Registration, sign-in, JWT sessions, saved wishlists, and customer order history
- Admin overview with revenue, order, customer, product, and low-stock metrics
- Product management with create, edit, archive, and inventory controls
- Order management with confirmed, packed, shipped, and delivered workflows
- Responsive storefront and dashboard layouts with toast feedback and loading states
- Express API deployed on Railway and a React frontend deployed on Cloudflare Pages

## Run locally

```bash
npm install
npm run dev
```

The storefront runs on `http://localhost:5173` and the API on `http://localhost:5100`.

Copy `server/.env.example` to `server/.env` and configure the values before using database-backed routes. The email assigned to `ADMIN_EMAIL` receives the admin role after registering or signing in.

Seed the initial catalog with:

```bash
npm run seed -w server
```

## Quality checks

```bash
npm run build
npm test
```
