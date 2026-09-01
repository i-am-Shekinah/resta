# Resta

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack restaurant management application with a customer-facing storefront and an admin dashboard. Browse the menu, place orders, make table reservations, and manage everything from a centralized admin panel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5 + Django REST Framework |
| Frontend | Vite + React + Tailwind CSS v3 |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL/Neon (production), SQLite (local dev) |
| Images | Cloudinary |
| Hosting | Render (API) + Vercel (SPA) |

## Features

- **Menu Browsing** — Categories, search, filtering, featured items, and detail pages with modifiers
- **Shopping Cart** — Add items with modifiers, adjust quantities, proceed to checkout
- **Online Ordering** — Place orders with a dummy payment flow, track order status
- **Table Reservations** — Check availability by date and party size, book tables
- **Admin Dashboard** — Manage menu items, orders, reservations, and tables
- **JWT Authentication** — Register, login, auto-refreshing tokens, role-based access (admin/staff/customer)
- **Profile Management** — User profiles with avatar upload via Cloudinary

## Project Structure

```
resta/
├── backend/
│   ├── config/                 # Django settings, URLs, WSGI
│   │   └── settings/          # base, local, production
│   ├── apps/
│   │   ├── accounts/          # Custom User (email login), Profile, JWT auth
│   │   ├── menu/              # Category, MenuItem, Modifier
│   │   ├── tables/            # Table model
│   │   ├── reservations/      # Reservation model + availability logic
│   │   ├── orders/            # Cart, Order, OrderItem + dummy payment
│   │   └── core/              # Base models, seed command
│   └── requirements/          # base.txt, local.txt, production.txt
├── frontend/
│   └── src/
│       ├── api/               # Axios client with JWT interceptor
│       ├── context/           # AuthContext, CartContext
│       ├── components/        # Navbar, filters, shared UI
│       ├── pages/             # Home, Menu, Cart, Checkout, Orders, Reservations, Auth, Dashboard
│       └── styles/            # Tailwind layers (index, components, utilities)
└── PLAN.md                    # Full architecture documentation
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Cloudinary account (for image uploads)
- A Neon/PostgreSQL database (for production)

### Installation

**Clone the repository:**

```bash
git clone <repo-url>
cd resta
```

**Backend:**

```bash
cd backend
python -m venv ../venv
source ../venv/bin/activate
pip install -r requirements/local.txt
```

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key
CLOUDINARY_URL=cloudinary://...
ALLOWED_HOSTS=localhost:8000
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

Run migrations and seed data:

```bash
python manage.py migrate
python manage.py seed
```

**Frontend:**

```bash
cd frontend
npm install
```

Create `frontend/.env` (optional — defaults to `http://localhost:8000/api`):

```env
VITE_API_URL=http://localhost:8000/api
```

### Running Locally

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend
cd backend
source ../venv/bin/activate
python manage.py runserver

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:8000/api`.

### Seed Data

The seed command (`python manage.py seed`) creates:

| Resource | Details |
|----------|---------|
| Admin user | `admin@resta.com` (password from `SEED_ADMIN_PASSWORD` env or random) |
| Staff user | `staff@resta.com` (password from `SEED_STAFF_PASSWORD` env or random) |
| Categories | 8 (Appetizers, Burgers, Pasta, Seafood, Salads, Sides, Desserts, Beverages) |
| Menu items | 23+ items with images, prices, and descriptions |
| Modifiers | 4 (Extra Cheese, GF Bun, Side Salad, Double Portion) |
| Tables | 10 (indoor 1-6, patio 7-10, capacities 2-8) |

## API Endpoints

### Auth

```
POST   /api/auth/register/
POST   /api/auth/login/           → JWT tokens
POST   /api/auth/refresh/
GET    /api/auth/me/
PATCH  /api/auth/me/
POST   /api/auth/change-password/
```

### Menu

```
GET    /api/menu/categories/      → with nested items
GET    /api/menu/items/           → ?category=slug&featured=true&search=
GET    /api/menu/items/:id/
GET    /api/menu/modifiers/
```

### Cart

```
GET    /api/cart/
POST   /api/cart/add/             → { menu_item, quantity, modifiers }
PATCH  /api/cart/items/:id/
DELETE /api/cart/items/:id/
DELETE /api/cart/clear/
```

### Orders

```
POST   /api/orders/checkout/      → Cart → Order (dummy payment)
GET    /api/orders/               → my orders (paginated)
GET    /api/orders/:id/
PATCH  /api/orders/:id/status/    → admin only
GET    /api/orders/admin/         → all orders (admin)
```

### Reservations

```
GET    /api/reservations/availability/  → ?date=&party_size=
POST   /api/reservations/
GET    /api/reservations/my/
PATCH  /api/reservations/:id/
```

### Tables (Admin)

```
GET    /api/tables/
POST   /api/tables/
PATCH  /api/tables/:id/
```

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero section, featured items, quick actions |
| `/menu` | Menu | Category tabs, item cards, search |
| `/menu/:slug` | Item Detail | Image, description, modifiers, add to cart |
| `/cart` | Cart | Items list, quantity controls, subtotal |
| `/checkout` | Checkout | Order summary, dummy payment |
| `/orders` | Order History | Past orders with status |
| `/orders/:id` | Order Detail | Status timeline, items |
| `/reservations` | Reservations | Make a new reservation |
| `/auth/login` | Login | Email + password |
| `/auth/register` | Register | Create account |
| `/dashboard/*` | Admin | Overview, menu, orders, reservations, tables management |
| `/profile` | Profile | User profile and settings |

## Deployment

### Backend (Render)

The `backend/render.yaml` blueprint handles deployment:
- Builds with `collectstatic`, `migrate`, and `seed`
- Runs with `gunicorn` (2 workers, 120s timeout)
- Connected to a Neon PostgreSQL database

Required environment variables:
```env
DJANGO_SETTINGS_MODULE=config.settings.production
DATABASE_URL=<neon-connection-string>
SECRET_KEY=<auto-generated>
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://resta-gilt.vercel.app
CSRF_TRUSTED_ORIGINS=https://resta-gilt.vercel.app,.onrender.com
CLOUDINARY_URL=<cloudinary-url>
```

### Frontend (Vercel)

The `frontend/vercel.json` rewrites all routes to `index.html` for SPA routing. Set `VITE_API_URL` to your production API URL if different from the default.

**Live:** [https://resta-gilt.vercel.app](https://resta-gilt.vercel.app)

## Development

```bash
# Lint (oxlint, not eslint)
cd frontend && npm run lint

# Build frontend
cd frontend && npm run build

# Run backend tests
cd backend && source ../venv/bin/activate && python manage.py test
```

## License

Licensed under the [MIT License](LICENSE).
