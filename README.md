# nepalgungdaba

`nepalgungdaba` is a Nepalgunj-first, multi-role food-delivery platform built with an Expo mobile client and an Express/MongoDB API. It is designed around Nepal-specific delivery realities such as landmark-based addresses, uncertain street addressing, cash on delivery, restaurant approval, rider approval, and role-specific access.

This repository now includes the production-style customer discovery slice through the cart foundation: project architecture, authentication/authorization, saved map-backed addresses, restaurant approval and management, menu management, nearby discovery, restaurant details, and a server-backed one-restaurant cart.

## Current capabilities

- Customer registration, login, persistent sessions, logout, forgot password, and reset password
- Dedicated restaurant application with business, schedule, landmark, and coordinate details
- Dedicated rider application with vehicle and driving-license validation
- Pending approval experience for restaurant and rider accounts
- JWT authentication and API-enforced role/status middleware
- Four role-aware mobile destinations: customer, restaurant, rider, and admin
- bcrypt password hashing and password-change session invalidation
- Duplicate phone/email protection and Nepal mobile-number normalization
- Authenticated Socket.IO foundation with per-user and per-role rooms
- Complete Mongoose model layer for users, addresses, restaurants, riders, menus, carts, orders, ratings, favorites, promotions, notifications, and platform settings
- Nepalgunj core settings seed with configurable delivery pricing and service radius
- Expo Go-compatible package selection, including location and maps
- GPS permission handling, draggable/tappable map pins, and saved Nepalgunj addresses
- Admin restaurant approval, rejection, suspension, and reactivation
- Restaurant profile, opening-hours, location, category, and menu-item management
- MongoDB geospatial nearby discovery with server-calculated distance and delivery fees
- API-backed customer home, restaurant details, and one-restaurant cart conflict handling

## Architecture

```text
Food-Delivery-App/
├── mobile/                 Expo SDK 57 + Expo Router mobile app
│   ├── app/                File-based auth and role routes
│   ├── components/         Reusable UI and route guards
│   ├── constants/          Original visual design tokens
│   ├── context/            Persistent authentication state
│   └── services/           Axios API and Socket.IO clients
├── server/                 Node.js + Express API
│   ├── src/
│   │   ├── config/         Validated environment and MongoDB connection
│   │   ├── constants/      Roles and order-state definitions
│   │   ├── controllers/    HTTP request orchestration
│   │   ├── middleware/     Auth, authorization, validation, sanitization, errors
│   │   ├── models/         Mongoose domain models and indexes
│   │   ├── routes/         REST routes
│   │   ├── scripts/        Admin creation and initial platform seed
│   │   ├── services/       Authentication and notification boundaries
│   │   ├── sockets/        Authenticated realtime connection setup
│   │   ├── utils/          JWT, response, error, distance helpers
│   │   └── validators/     Zod request contracts
│   └── test/               Node test suite
├── package.json            npm workspaces
└── package-lock.json       Reproducible dependency tree
```

## Technology

The mobile app uses JavaScript, React Native, Expo SDK 57, Expo Router, Axios, Context API, AsyncStorage, Expo Location, React Native Maps, and Socket.IO Client. The backend uses Node.js, Express 5, MongoDB/Mongoose, JWT, bcrypt, Zod, Helmet, CORS, rate limiting, and Socket.IO.

Expo SDK 57 targets React Native 0.86 and React 19.2. The checked-in dependency versions pass `expo install --check`, and the Android production bundle compiles successfully.

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer
- MongoDB 7+ locally, or a MongoDB Atlas connection string
- Expo Go compatible with Expo SDK 57
- Phone and development computer on the same network for physical-device testing

## Install

From the repository root:

```bash
npm install
```

This installs both workspaces. You can also operate them independently with `cd server` or `cd mobile`.

## Backend configuration and startup

1. Copy `server/.env.example` to `server/.env`.
2. Set a random `JWT_SECRET` containing at least 32 characters.
3. Set `MONGODB_URI` to a local or Atlas database.
4. Start the API.

```bash
cd server
npm run dev
```

The HTTP and Socket.IO server listens on `0.0.0.0:5000`, so a phone on the same LAN can reach it. Health check:

```text
GET http://localhost:5000/api/health
```

Create the initial Nepalgunj service area and pricing settings:

```bash
npm run seed:core
```

Create an admin without exposing an admin registration endpoint:

```bash
npm run create:admin -- "Admin Name" admin@example.com +9779800000000 "StrongPassword!1"
```

## Mobile configuration and Expo Go

1. Copy `mobile/.env.example` to `mobile/.env`.
2. Replace `192.168.1.10` with the development computer's LAN IPv4 address.
3. Start Expo.

```bash
cd mobile
npx expo start
```

On Windows, find the LAN address with `ipconfig` and use the IPv4 address for the active Wi-Fi/Ethernet adapter. `localhost` on a physical phone points to the phone itself, so it cannot reach the computer's API. Keep the phone and computer on the same network and allow port 5000 through the firewall if prompted.

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:5000/api
EXPO_PUBLIC_SOCKET_URL=http://YOUR_COMPUTER_LAN_IP:5000
```

## Authentication API

```text
POST /api/auth/register
POST /api/auth/register/restaurant
POST /api/auth/register/rider
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
POST /api/auth/logout
```

Responses consistently use `{ success, message, data }`; validation failures also return field-level `details`. Client-submitted roles are never accepted. Customer accounts start active, while restaurant and rider accounts start pending.

Password reset tokens are SHA-256 hashed in MongoDB and expire after 15 minutes. A production email/SMS provider should call the existing notification service boundary. For local testing only, setting `LOG_PASSWORD_RESET_TOKEN=true` exposes the token in the API response and server log; keep it false outside development.

## Address, restaurant, menu, and cart APIs

```text
GET    /api/addresses
POST   /api/addresses
PATCH  /api/addresses/:id
DELETE /api/addresses/:id
PATCH  /api/addresses/:id/default

GET    /api/restaurants/nearby?latitude=&longitude=&radius=
GET    /api/restaurants/:id?latitude=&longitude=
GET    /api/restaurants/me
PATCH  /api/restaurants/me

GET    /api/admin/restaurants?status=
PATCH  /api/admin/restaurants/:id/approve
PATCH  /api/admin/restaurants/:id/reject
PATCH  /api/admin/restaurants/:id/suspend
PATCH  /api/admin/restaurants/:id/reactivate

GET    /api/menu
POST   /api/menu/categories
PATCH  /api/menu/categories/:id
DELETE /api/menu/categories/:id
POST   /api/menu/items
PATCH  /api/menu/items/:id
PATCH  /api/menu/items/:id/availability
DELETE /api/menu/items/:id

GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart
```

All routes above are JWT protected and role restricted. Ownership comes from the authenticated user, never a client-supplied user or restaurant ID.

## Database design

The model layer includes `User`, `CustomerProfile`, `Restaurant`, `Rider`, `Address`, `Category`, `MenuItem`, `Cart`, `Order`, `Review`, `Favorite`, `PromoCode`, `Notification`, and `PlatformSettings`.

Important safeguards are already modeled:

- order items and delivery addresses are purchase-time snapshots;
- monetary totals have separate server-owned fields;
- restaurant and rider locations have `2dsphere` indexes;
- addresses require coordinates and landmarks;
- order status changes retain actor/time history;
- one review is allowed per order;
- favorites use target-specific partial unique indexes;
- service areas and delivery prices are configurable platform data;
- passwords and reset secrets are excluded from ordinary queries and JSON.

## Realtime architecture

Socket.IO uses the same JWT as REST authentication. A connected client joins private `user:<id>` and `role:<role>` rooms. Order rooms are namespaced as `order:<id>`. Live order events and ephemeral rider GPS broadcasts will build on these rooms in Phases 10–13; continuous GPS data is not written to MongoDB by this foundation.

## Quality checks

From the root:

```bash
npm test
npm run lint
cd mobile
npx expo install --check
npx expo export --platform android --output-dir dist
```

## Security practices

- bcrypt cost factor 12 for stored passwords
- signed JWTs with issuer and audience validation
- token invalidation after password change
- route-level role and account-status middleware
- Zod validation before controllers
- request key sanitization against MongoDB operator injection
- Helmet, CORS allow-listing in production, request size limits, and auth rate limiting
- generic forgot-password response to prevent account enumeration
- `.env` files ignored; examples contain no credentials
- production startup refuses the development JWT secret

## Current limitations and next phases

MongoDB must be available for database-backed flows. Checkout and order creation remain intentionally disabled until this foundation is exercised with real restaurant data. Binary image upload is not included; restaurant and menu images currently accept hosted URLs. Email/SMS delivery, order transitions, rider assignment, live tracking, reviews, and promotion redemption remain later phases.

The home screen includes placeholders for offers and previous orders because checkout/history APIs are not part of this pass. Nearby, popular, and restaurant/menu content are API-backed rather than hard-coded.

## Product direction

The app uses original `nepalgungdaba` branding and a warm, locally grounded visual system. The initial market is Nepalgunj (`Asia/Kathmandu` timezone), represented as configurable data so additional Nepal cities can be added without restructuring the application.
