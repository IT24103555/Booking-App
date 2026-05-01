# Evoria – Event Booking and Management Application

This repository contains **two separate projects**:

- `backend/` → Node.js + Express API (MongoDB Atlas, JWT auth)
- `frontend/` → React Native mobile app (Expo-ready structure)

## 1) Backend Setup (Node.js + Express + MongoDB)

### Prerequisites
- Node.js (LTS recommended)
- MongoDB Atlas cluster (recommended for final demo)

### Install & Run (Local)
1. Open a terminal in `evoria-event-booking-app/backend`
2. Install packages:
   - `npm install`
3. Create `.env` using `.env.example`:
   - `PORT=5000`
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
4. Start the server:
   - Dev: `npm run dev`
   - Prod: `npm start`

### Test
- Open: `GET /` → returns `{ "message": "Evoria API is running" }`

## 2) Frontend Setup (React Native)

### Important
For the **final demo**, your mobile app must call a **hosted API URL** (Render/Railway), not `localhost`.

### Configure API Base URL
- Update `frontend/src/config/apiConfig.js`:
  - `API_BASE_URL` should be something like: `https://your-api.onrender.com`

### Run (Expo)
1. Open a terminal in `evoria-event-booking-app/frontend`
2. Install packages:
   - `npm install`
3. Start:
   - `npm start`

> If you are using Windows PowerShell with restricted execution policy, run `npm.cmd` instead of `npm`.

## Postman API Endpoint Table (Backend)

Base URL examples:
- Local: `http://localhost:5000`
- Hosted: `https://YOUR-RENDER-APP.onrender.com`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register user (name, email, password, optional phone, role) |
| POST | `/api/auth/login` | No | Login user (email, password) |
| GET | `/api/auth/me` | Bearer | Get logged-in profile |

### Users (Admin)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/users` | Bearer | admin | Get all users |
| GET | `/api/users/:id` | Bearer | admin | Get single user |
| PUT | `/api/users/:id` | Bearer | admin | Update user (role/isActive/etc.) |
| DELETE | `/api/users/:id` | Bearer | admin | Delete user |

### Profile (Any Logged-in User)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Bearer | Get my profile |
| PUT | `/api/users/me` | Bearer | Update my profile (name, phone) |

### Ticket Types
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/ticket-types` | No | - | List ticket types |
| GET | `/api/ticket-types/:id` | No | - | Ticket type details |
| POST | `/api/ticket-types` | Bearer | admin/organizer | Create ticket type |
| PUT | `/api/ticket-types/:id` | Bearer | admin/organizer | Update ticket type |
| DELETE | `/api/ticket-types/:id` | Bearer | admin/organizer | Delete ticket type |

### Venues
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/venues` | No | - | List venues |
| GET | `/api/venues/:id` | No | - | Venue details |
| POST | `/api/venues` | Bearer | admin/organizer | Create venue (optionally upload `image`) |
| PUT | `/api/venues/:id` | Bearer | admin/organizer | Update venue (optionally upload `image`) |
| DELETE | `/api/venues/:id` | Bearer | admin/organizer | Delete venue |

### Events
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/events` | No | - | List events (populated venue + ticket types) |
| GET | `/api/events/:id` | No | - | Event details |
| POST | `/api/events` | Bearer | admin/organizer | Create event (optionally upload `image`) |
| PUT | `/api/events/:id` | Bearer | admin/organizer | Update event |
| DELETE | `/api/events/:id` | Bearer | admin/organizer | Delete event |

### Bookings
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/bookings` | Bearer | any | Create booking (checks ticket availability, prevents overbooking) |
| GET | `/api/bookings/my` | Bearer | any | Get my bookings |
| GET | `/api/bookings/:id` | Bearer | owner or staff | Get booking details |
| PUT | `/api/bookings/:id/cancel` | Bearer | owner or staff | Cancel booking (restores availability) |
| GET | `/api/bookings` | Bearer | admin/organizer | Get all bookings |
| PUT | `/api/bookings/:id` | Bearer | admin/organizer | Update booking (quantity/status) |
| DELETE | `/api/bookings/:id` | Bearer | admin/organizer | Delete booking |

### Session Agendas
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/session-agendas` | No | - | List all sessions |
| GET | `/api/session-agendas/event/:eventId` | No | - | Sessions by event |
| GET | `/api/session-agendas/:id` | No | - | Session details |
| POST | `/api/session-agendas` | Bearer | admin/organizer | Create session |
| PUT | `/api/session-agendas/:id` | Bearer | admin/organizer | Update session |
| DELETE | `/api/session-agendas/:id` | Bearer | admin/organizer | Delete session |

## Deployment Guide (Render + MongoDB Atlas)

### A) MongoDB Atlas
1. Create a new Atlas cluster (free tier is OK for university projects).
2. Create a database user and password.
3. Network Access:
   - For quick demo: allow `0.0.0.0/0` (not recommended for real production).
4. Copy the connection string and set it as `MONGO_URI` on Render.

### B) Deploy Backend on Render
1. Push `evoria-event-booking-app` to GitHub.
2. In Render → **New** → **Web Service**.
3. Choose your GitHub repo.
4. Root Directory: `evoria-event-booking-app/backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (optional)
   - `CORS_ORIGIN` (set `*` for demo or set your Expo dev origin)
8. Deploy.
9. Copy the service URL (example: `https://evoria-api.onrender.com`).

### C) Connect Mobile App to Hosted API
1. Open `frontend/src/config/apiConfig.js`
2. Set `API_BASE_URL` to your Render URL.
3. Rebuild / restart Expo.

## Notes for Viva (Explainable Modules)
- Each module is separated into: `models/`, `validations/`, `controllers/`, `routes/`, and `middleware/`.
- Validations use Joi and return clear, beginner-friendly messages.
- Booking logic includes:
  - Availability check
  - Overbooking prevention (atomic `$gte` + `$inc` update)
  - Restore tickets when booking is cancelled/deleted
