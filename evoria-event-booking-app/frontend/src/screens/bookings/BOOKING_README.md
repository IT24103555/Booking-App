Booking Screen Notes

- File: CreateBookingScreen.js
- Location: frontend/src/screens/bookings/

What it does
- Provides selectors for Event and Ticket Type (populated from `/api/events`).
- Shows Venue details and Session agendas for the selected event (fetched from `/api/session-agendas/event/:eventId`).
- Enforces ticket availability: `TicketType.availableQuantity` is used to cap the `quantity` input.
- Sends booking payload as `{ eventId, ticketTypeId, quantity }` to `POST /api/bookings` (requires authentication).

Next improvements
- Replace inline lists with searchable/autocomplete dropdowns.
- Show ticket price breakdown and currency formatting.
- Reserve seats client-side only after availability re-check on submit (optimistic vs pessimistic locking).
- Show clearer errors when booking fails (e.g., sold out, insufficient quantity).
