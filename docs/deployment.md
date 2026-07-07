# Deployment Guide

## Requirements

- GitHub account
- Supabase project
- Vercel account

---

## 1. Clone

```bash
git clone https://github.com/yourusername/DeskDesign3D.git

cd DeskDesign3D
```

---

## 2. Install

```bash
npm install
```

---

## 3. Configure Supabase

Copy

```
.env.example
```

to

```
.env
```

Fill in

```
SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY
```

---

## 4. Create Database

Run SQL scripts in this order

```
schema.sql

functions.sql

policies.sql

storage.sql

seed.sql
```

---

## 5. Start locally

```bash
npm run dev
```

---

## 6. Deploy to Vercel

Import the GitHub repository.

Framework:

```
Other
```

Build command

```
None
```

Output directory

```
.
```

Environment variables

```
SUPABASE_URL

SUPABASE_ANON_KEY
```

Deploy.
