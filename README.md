 # DeskDesign3D

DeskDesign3D is a modern webshop for selling premium 3D-printed desk accessories.

## Features

- User authentication
- Product catalog
- Categories
- Search and filters
- Shopping cart
- Checkout
- Order history
- Favorites
- Reviews
- Admin dashboard
- Product management
- Image uploads using Supabase Storage

---

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- Supabase
- Vercel

---

## Installation

```bash
git clone <repository>

cd DeskDesign3D

npm install
```

Create a `.env` file based on `.env.example`.

---

## Running locally

```bash
npm run dev
```

Open:

http://localhost:3000

---

## Deploy

Push the repository to GitHub and import it into Vercel.

Add the environment variables from `.env.example`.

---

## Database

Run the SQL scripts in the following order:

1. schema.sql
2. functions.sql
3. policies.sql
4. storage.sql
5. seed.sql

---

## Default roles

- customer
- admin

The first account can be promoted to `admin` by updating the `profiles.role` column.
