# Resta — Restaurant Management App

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Django 5 + Django REST Framework |
| Frontend | Vite + React + Tailwind CSS v3 |
| Auth | `djangorestframework-simplejwt` |
| DB | Neon (PostgreSQL — production), SQLite (local dev) |
| Images | Cloudinary (`cloudinary-storage`) |
| Payments | Dummy flow (placeholder step, skip real processing) |
| Hosting | Render (Django API) + Vercel (React SPA) |
| Dev | Plain Python env (no Docker) |

---

## Project Structure

```
resta/
├── backend/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py           # Shared settings
│   │   │   ├── local.py          # SQLite, debug=True, console email
│   │   │   └── production.py     # Neon DB, Cloudinary, debug=False
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/             # Custom User (email), Profile, JWT auth
│   │   ├── menu/                 # Category, MenuItem, Modifier
│   │   ├── tables/               # Table model
│   │   ├── reservations/         # Reservation model + availability logic
│   │   ├── orders/               # Cart/Order/OrderItem + dummy payment
│   │   └── core/                 # Base models (Timestamped, etc.) + seed command
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── local.txt
│   │   └── production.txt
│   ├── manage.py
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios client (base URL from env)
│   │   ├── styles/
│   │   │   ├── index.css         # @tailwind directives + custom layer utilities
│   │   │   ├── components.css    # @layer components { .btn-primary { ... } }
│   │   │   └── utilities.css     # @layer utilities
│   │   ├── components/           # Shared: Navbar, Footer, Button, Card, etc.
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Menu/
│   │   │   ├── Cart/
│   │   │   ├── Checkout/         # Dummy payment step here
│   │   │   ├── Orders/
│   │   │   ├── Reservations/
│   │   │   ├── Auth/             # Login + Register
│   │   │   └── Dashboard/        # Admin panel
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── hooks/                # useAuth, useCart, useApi
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vercel.json
└── .gitignore
```

---

## Data Models

### accounts.User (custom, AbstractBaseUser)
- `email` (unique, login field), `password`, `role` (admin/staff/customer), `is_active`, `is_staff`

### accounts.Profile
- `user` (OneToOne), `phone`, `first_name`, `last_name`, `created_at`

### menu.Category
- `name`, `slug`, `description`, `order`, `is_available`

### menu.MenuItem
- `category` (FK), `name`, `slug`, `description`, `price`, `image` (CloudinaryField), `is_available`, `is_featured`, `prep_time_minutes`

### menu.Modifier
- `name`, `price`, `max_selections`

### tables.Table
- `number`, `capacity`, `location` (indoor/patio), `status` (available/reserved/occupied)

### reservations.Reservation
- `customer` (FK User), `table` (FK), `date`, `time`, `party_size`, `status` (pending/confirmed/cancelled/completed), `notes`, `created_at`

### orders.Cart (OneToOne per user)
- `user` (OneToOne), `created_at`, `updated_at`

### orders.CartItem
- `cart` (FK), `menu_item` (FK), `quantity`, `modifiers` (JSON)

### orders.Order
- `user` (FK), `items` (JSON or through table), `status` (pending/confirmed/preparing/ready/served/completed/cancelled), `subtotal`, `tax`, `total`, `payment_method` (dummy), `payment_status` (pending/paid), `created_at`

### orders.OrderItem
- `order` (FK), `menu_item` (FK), `quantity`, `unit_price`, `modifiers` (JSON)

---

## API Endpoints

```
Auth:
  POST   /api/auth/register/
  POST   /api/auth/login/           # → JWT tokens
  POST   /api/auth/refresh/
  GET    /api/auth/me/

Menu:
  GET    /api/menu/categories/      # Ordered, with nested items
  GET    /api/menu/items/           # Filter: ?category=slug&featured=true&search=
  GET    /api/menu/items/:id/

Cart:
  GET    /api/cart/                 # Current user's cart
  POST   /api/cart/add/             # { menu_item, quantity, modifiers }
  PATCH  /api/cart/items/:id/       # Update quantity
  DELETE /api/cart/items/:id/       # Remove item
  DELETE /api/cart/clear/           # Clear cart

Orders:
  POST   /api/orders/checkout/      # Cart → Order (dummy payment)
  GET    /api/orders/               # My orders (paginated)
  GET    /api/orders/:id/           # Order detail

  (Admin):
  PATCH  /api/orders/:id/status/    # Update status
  GET    /api/orders/admin/         # All orders

Tables (Admin):
  GET    /api/tables/
  POST   /api/tables/
  PATCH  /api/tables/:id/

Reservations:
  GET    /api/reservations/availability/  # ?date=&party_size= → available slots
  POST   /api/reservations/               # Create reservation
  GET    /api/reservations/my/            # My reservations
  PATCH  /api/reservations/:id/           # Cancel
```

---

## Frontend Routes

```
/                    → Home (hero, featured grid, quick actions)
/menu                → Menu (category tabs, item cards, search)
/menu/:slug          → ItemDetail (image, description, modifiers, add-to-cart)
/cart                → Cart (items list, qty controls, subtotal → checkout btn)
/checkout            → Checkout (order summary, customer info, dummy pay btn)
/orders              → OrderHistory (list of past orders with status)
/orders/:id          → OrderDetail (status timeline, items)
/reservations        → ReservationForm (date picker, time slots, party size)
/auth/login          → Login
/auth/register       → Register
/dashboard           → Admin overview (stats, recent orders)
/dashboard/menu      → Manage menu items & categories
/dashboard/orders    → Manage orders (status updates)
/dashboard/reservations → Manage reservations
/dashboard/tables    → Manage tables
```

---

## Dummy Payment Flow

1. User reviews order → clicks **Place Order**
2. Frontend calls `POST /api/orders/checkout/` with `{ payment_method: "dummy" }`
3. Backend creates the Order, sets `payment_status: "paid"` immediately, returns order detail
4. Frontend shows success screen with order number and redirects to `/orders/:id`

---

## Seed Script

Location: `backend/apps/core/management/commands/seed.py`

Idempotent — uses `get_or_create` and `update_or_create` with natural keys (slug, email, table number).

Seeds:
- Admin user (`admin@resta.com` / `admin123`)
- Staff user (`staff@resta.com` / `staff123`)
- 8 categories (Appetizers, Burgers, Pasta, Seafood, Salads, Sides, Desserts, Beverages)
- 20+ menu items with realistic restaurant data
- 4 modifiers (Extra Cheese, GF Bun, Side Salad, Double Portion)
- 10 tables (indoor 1-6, patio 7-10, capacities 2-8)

---

## Implementation Phases

| Phase | What | Depends On |
|-------|------|------------|
| 1 | Django project, custom User, DRF boilerplate, Cloudinary config, Neon/Render config | — |
| 2 | Vite + React scaffold, routing, Tailwind, Axios client | Phase 1 |
| 3 | Menu app (backend + frontend) | Phase 1, 2 |
| 4 | Cart + Orders app (backend + frontend, dummy payment) | Phase 3 |
| 5 | Auth (JWT, login/register, protected routes) | Phase 1, 2 |
| 6 | Reservations + Tables (backend + frontend) | Phase 5 |
| 7 | Admin Dashboard (frontend: manage menu, orders, reservations, tables) | Phase 3-6 |
| 8 | Seed script | Phase 1 |
| 9 | Deploy to Render + Vercel | Phase 1-8 |
