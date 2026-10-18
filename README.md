# BuyMore catalog API

Express + MongoDB API shared by the BuyMore storefront and catalog dashboard. This iteration supports product/category listing, creation, editing and deletion. Checkout, payments, customer accounts and order processing are not implemented.

## Run locally

Use Node.js 20 or newer and a local MongoDB server (or MongoDB Atlas).

```sh
npm ci --legacy-peer-deps
cp .env.example .env
# Fill ADMIN_TOKEN with a random value of at least 24 characters.
node --env-file=.env server.js
```

`npm start` also starts the server when environment variables are supplied by your shell or host. The server waits for MongoDB before accepting traffic. Configure CORS_ORIGINS for the exact storefront/dashboard URLs. Keep `.env` private. Catalog writes require `Authorization: Bearer <ADMIN_TOKEN>`; public listing does not. This token protects a single-admin demo and is not a multi-user authentication system.

## API

All paths start with `/api`. `GET /health` checks the HTTP process. For both `/products` and `/categories`, use GET to list, POST to create, PUT `/:id` to replace editable fields, and DELETE `/:id` to remove. Invalid input returns 400, invalid credentials 401, missing records 404. Deletion returns 204.

A category requires `name` (legacy `categoryName` accepted), `description`, `imageUrl`. A product requires `name`, `description`, `imageUrl`, `country`, `category`, with optional string-array `tags`. Image URLs must use HTTP(S). Category names are currently stored as product text; changing a category does not cascade to existing products. Prices and checkout are deliberately outside this catalog iteration.

Run `npm test`. Tests exercise real HTTP requests with an in-memory repository double; MongoDB persistence must also be verified against your configured database before deployment. Existing older controller/service files remain as historical source; `routes/catalogRoutes.js` is the active API.
