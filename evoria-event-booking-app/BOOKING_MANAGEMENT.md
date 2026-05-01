# Booking Management System

## Overview
The booking system now supports professional admin management with status tracking and role-based UI.

## Booking Statuses

| Status | Color | Meaning |
|--------|-------|---------|
| **Pending** | Amber | Awaiting admin confirmation |
| **Confirmed** | Green | Approved by admin; customer can attend |
| **Cancelled** | Red | Cancelled; tickets returned to inventory |

## Admin Capabilities

### Confirm Booking
- **Endpoint**: `PUT /api/bookings/:id/confirm`
- **Auth**: Admin or Organizer
- **Effect**: Changes booking status from Pending → Confirmed
- **UI Button**: ✓ Confirm Booking (blue, only shows when Pending)
- **Restrictions**: Cannot confirm a Cancelled booking; cannot re-confirm

### Cancel Booking
- **Endpoint**: `PUT /api/bookings/:id/cancel`
- **Auth**: Admin, Organizer, or Booking Owner
- **Effect**: Changes status to Cancelled and restores tickets to inventory
- **UI Button**: ✕ Cancel Booking (red, hides when already Cancelled)
- **Restrictions**: Cannot cancel an already Cancelled booking

## User Experience

### For Customers
- View their booking details with color-coded status indicator
- See status: Pending (amber) → Confirmed (green) or Cancelled (red)
- Can cancel their own bookings if not already cancelled
- Cannot confirm bookings

### For Admins/Staff
- View all bookings and individual details
- **Confirm** pending bookings with one button
- **Cancel** bookings to free up tickets
- All actions trigger confirmation dialogs with clear explanations
- Status updates instantly after action

## Action Flow

```
Pending Booking
├─ Admin sees: [✓ Confirm] [✕ Cancel]
└─ User sees: [✕ Cancel]

Confirmed Booking
├─ Admin sees: (no actions)
└─ User sees: (no actions - read-only)

Cancelled Booking
├─ Admin sees: "Booking cancelled" (read-only)
└─ User sees: "Your booking has been cancelled" (read-only)
```

## Technical Details

### Frontend Files
- `frontend/src/screens/bookings/BookingDetailsScreen.js` - Main booking details view with role-based actions
- `frontend/src/api/bookingApi.js` - API methods: `confirm()`, `cancel()`

### Backend Files
- `backend/src/controllers/bookingController.js` - Controllers: `confirmBooking()`, `cancelBooking()`
- `backend/src/routes/bookingRoutes.js` - Routes: `PUT /bookings/:id/confirm`, `PUT /bookings/:id/cancel`

### Status Colors
- Pending: `#f59e0b` (amber-500)
- Confirmed: `#10b981` (green-600)
- Cancelled: `#ef4444` (red-500)

## API Examples

```bash
# Confirm a booking (admin only)
curl -X PUT http://localhost:5000/api/bookings/[booking_id]/confirm \
  -H "Authorization: Bearer [admin_token]"

# Cancel a booking (admin or owner)
curl -X PUT http://localhost:5000/api/bookings/[booking_id]/cancel \
  -H "Authorization: Bearer [token]"
```

## Testing Notes

✓ Admin can confirm pending bookings → status becomes Confirmed  
✓ Re-confirming a confirmed booking is blocked  
✓ Admin can cancel bookings → status becomes Cancelled & tickets restored  
✓ Bookings display with proper color-coded status indicators  
✓ UI shows context-appropriate buttons based on user role and booking status  
✓ Cancelled bookings show read-only state with message  

