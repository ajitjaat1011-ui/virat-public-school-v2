# Virat Public School — Website (v2)

A full-stack Cloudflare Pages application for **Virat Public School, Viratnagar, Kotputli-Behror, Rajasthan**.

- **Frontend:** Static HTML + CSS + vanilla JS (mobile-first, WCAG 2.1 AA)
- **Backend:** Cloudflare Pages Functions (Node.js, `nodejs_compat`)
- **Database:** Cloudflare D1 (SQLite-compatible, free tier)
- **Auth:** Session cookies (HttpOnly, Secure, SameSite=Lax), bcrypt password hashing
- **Admin CMS:** Built-in at `/admin`, protected by login

## Features

### Public site (22+ pages)
Home · About · Infrastructure · Faculty · Admissions (with online inquiry form) · Fee Structure · Results (with roll number + DOB lookup) · Gallery (with lightbox) · Notice Board (with category filter) · Notice Detail · Events Calendar · Holiday List · Contact · Mandatory Public Disclosures · Privacy · Terms · Accessibility · Sitemap · 404

### Admin CMS (at `/admin`)
- **Dashboard** with KPIs
- **Notices** — create, edit, publish, soft-delete
- **Gallery Albums** — create, upload photos (direct to R2), publish
- **Results** — upload CSV, set exam metadata, publish
- **Inquiries** — view, mark as contacted/admitted, delete
- **Contact Messages** — view, mark as read
- **Audit Log** — every admin action recorded
- **Users** — create/manage admin users (admin role only)

### Security
- HTTPS only, HSTS-ready
- Bcrypt password hashing (cost 12)
- Session cookies with HttpOnly + Secure + SameSite=Lax
- CSRF token on all state-changing forms
- Honeypot on public forms
- Rate limiting on auth and form endpoints
- Soft delete + audit log for accountability

## Local development

```bash
npm install
npm run db:init:local    # create the D1 schema locally
npm run db:seed:local    # add sample data
npm run dev              # start dev server on http://localhost:8788
```

## Deployment

```bash
# One-time setup
npx wrangler d1 create vps-database
# Then update wrangler.toml with the returned database_id

# Schema + seed
npm run db:init:remote
npm run db:seed:remote

# Deploy
npm run deploy
```

Default admin (change after first login):
- **Username:** `admin`
- **Password:** `VPS@Kotputli2026`
