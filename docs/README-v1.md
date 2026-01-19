# HPB E-Commerce App — Version 1 (V1)

Version 1 delivers the core customer booking flow with authenticated access, booking pricing snapshots, and a PayPal “Create Order → Redirect” payment handoff (Option A).

This version focuses on:
- A working end-to-end booking lifecycle
- Ownership + lifecycle validation in the backend
- Predictable frontend state machines (loading/ready/error)
- A clean foundation for a Version 2 UI + payment revamp

---

## Tech Stack (V1)

**Backend**
- Node.js + Express
- PostgreSQL
- Auth via cookie-based JWT (protected routes require credentials)

**Frontend**
- React (Vite)
- Axios for API calls (with credentials)

**Payments**
- PayPal Checkout (Create Order endpoint; redirect to PayPal approval URL)

---

## Run Locally

### 1) Install dependencies

Backend:
- `cd server`
- install deps
- start server

Frontend:
- `cd client`
- install deps
- start dev server

> Note: Your frontend dev server should proxy requests to the backend (or use matching base URLs), and axios requests must include `withCredentials: true`.

---

## Environment Variables (Backend)

Set these in your backend environment:

- `PAYPAL_BASE_URL`
  - Sandbox: `https://api-m.sandbox.paypal.com`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

Auth / cookies (names will match your implementation):
- `JWT_SECRET`
- cookie name for access token (if applicable)
- cookie config (secure/sameSite) depending on dev/prod

---

## Database Notes (V1)

### Booking pricing snapshots
When a booking is created, a pricing snapshot is written to `booking_pricing_snapshots` inside the same DB transaction so pricing is “frozen” at creation time.

### Payments table
V1 PayPal create-order inserts a row in `payments` with:
- provider = `paypal`
- status = `created`
- provider_order_id = PayPal order id
- amounts stored in cents

Make sure the `payments.id` column has a default (UUID generation) OR is provided by the insert.
(If `payments.id` has no default, inserts will fail with a NOT NULL violation.)

---

## API Overview (V1)

### Bookings

#### POST `/api/bookings`
Creates a booking and a pricing snapshot.

**Request body**
- `product_id`
- `event_start_at` (ISO timestamp)
- `duration_minutes` (number)
- `timezone`
- `city`
- `state`
- `zip`
- `notes` (optional)

**Response**
- `{ booking, snapshot }`

#### GET `/api/bookings/me`
Returns bookings for the authenticated user (with snapshot join).

**Response**
- `{ bookings: [...] }`

#### GET `/api/bookings/:bookingId`
Returns one booking if it belongs to the authenticated user.

---

### Payments (PayPal Option A)

#### POST `/api/payments/paypal/create-order`
Creates a PayPal order and returns an approval URL.

Backend validation:
- Auth required
- Booking must exist
- Ownership check (booking belongs to current user)
- Booking must be in `requested` status
- Duplicate payment guard:
  - If an existing payment exists in (`created`, `requires_capture`, `captured`), the route blocks appropriately

**Response**
- `{ payment, approvalUrl }`

Frontend behavior:
- When approvalUrl is returned, the frontend redirects:
  - `window.location.href = approvalUrl`

---

## Frontend Page Behavior (V1)

### BookingNew
- Form page that submits `POST /api/bookings`
- Uses a simple page state machine:
  - `ready` → `submitting` → (`ready` + redirect) or `error`
- Converts `datetime-local` input to ISO before sending

### MyBookings
- Fetches `GET /api/bookings/me`
- Displays list of bookings
- Provides navigation to BookingDetail

### BookingDetail
- Fetches `GET /api/bookings/:id`
- Uses predictable states:
  - loading → ready / not_found / error
- PayPal is a mini state machine:
  - `payStatus` + `payError` are isolated so payment failures don’t break the page
- Pay button is gated by lifecycle:
  - only enabled when `booking.status === "requested"`

---

## Known Limitations (V1)

These are intentionally deferred to V2:
- PayPal return/cancel handling and capture UX improvements
- Webhook-based reconciliation
- “Resume payment” if a create-order already exists (409 handling UX improvements)
- Address normalization / richer location fields
- Full UI/UX revamp and component system

---

## Troubleshooting

### 401 on protected endpoints
- Confirm axios requests include `{ withCredentials: true }`
- Confirm cookies are being set and sent
- Confirm middleware order for protected routes:
  - token extraction → token verification → attachUser → ensureAuth → controller

### 409 “payment already in progress”
This is expected in V1.
The backend prevents duplicate PayPal orders for the same booking. In V2 we’ll add a “resume payment” UX (fetch latest approval url or allow cancel/retry properly).

### PayPal DNS / base URL issues
Ensure `PAYPAL_BASE_URL` is not wrapped in quotes in a way that becomes part of the value and breaks DNS resolution.

---

## Versioning

- V1: Booking flow + PayPal create-order redirect (Option A)
- V2: UI revamp + payments UX hardening + lifecycle polish + capture/return flows
