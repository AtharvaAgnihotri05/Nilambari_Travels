# Seat Architecture Redesign & Admin Backend Integration Plan

This plan outlines the steps completely redesign the seat layout to precisely mirror the sleeper bus image provided. It also details the backend API integraton for the Admin Dashboard and crucial bug fixes for real-time seat tracking.

## User Review Required

> [!WARNING]  
> The new UI layout shifts from simple squares to rectangular sleeper beds categorized into "Lower Deck" and "Upper Deck". Prices for the left column will dynamically reflect ₹1050, and the right two columns will reflect ₹900 to exactly match the screenshot. 
> 
> Furthermore, the Admin login will transition fully from "Dummy Data" to real database API verification. Please review these structural updates.

## Proposed Changes

### Admin Dashboard (Database Integration)

#### [MODIFY] `admin-login.html`
- Replace local `admin/1234` static checks with an AJAX `POST` fetch call to `http://localhost:5000/api/admin/login`.
- Manage the JWT authentication token seamlessly within `localStorage` for persistent secure session management.

#### [MODIFY] `backend/models/Bus.js`
- Add a new field `seatPrices: { type: Map, of: Number, default: {} }` to store varying prices for specific seats (e.g., `{'1': 1050, '2': 900}`). Seat buttons will fallback to the base `price` if a specific seat price isn't mapped.

#### [MODIFY] `admin-dashboard.html`
- Shift table hydration from the static local `data.js` `BUSES` array to instead dynamically `GET` the live fleet from `http://localhost:5000/api/buses`.
- Update the **Add Bus** modal to fire an authenticated `POST` request to `http://localhost:5000/api/buses`.
- Update the **Set Seat Price** modal to allow selecting a specific `Seat Number` (or comma-separated list) alongside the price to populate the `seatPrices` map instead of merely tweaking the generic base cost. Submit updates via a `PUT` request to `http://localhost:5000/api/buses/:id`.

### Frontend Application Layer (Sleeper Layout & Debugs)

#### [MODIFY] `results.html`
- Bug Fix: Map `routeObj.bus._id` explicitly correctly so the seats page handles object destructuring cleanly avoiding `undefined/null` busId errors.

#### [MODIFY] `seats.html`
- **Closure Bug Fix:** Ensure the dynamically bound click-listener for `toggleSeat` rigorously respects the specific nested `seatNum` rather than defaulting to `33` due to loop scoping bleed.
- **Sleeper UI Architecture:** 
  - Restructure the rendering algorithm entirely. Instead of a linear loop, build two explicit containers: **Lower Deck** and **Upper Deck**.
  - Insert the "Steering Wheel" icon exactly at the top right of the Lower Deck.
  - Formulate individual seat markup inspecting the live `bus.seatPrices[seatNum]` (or fallback logic using base price) to dynamically insert accurate pricing directly beneath each seat (e.g. `₹1050` vs `₹900`).
  - Implement dynamic gender/status SVGs securely mapping booked aesthetic boundaries.

#### [MODIFY] `css/style.css`
- Revise the `.seat-grid` dimensions.
- Redefine `.seat` styles to match the tall, rectangular profile with rounded corners standard to sleeper berths.
- Assign precise internal alignment so pricing anchors perfectly to the bottom-center padding inside or directly below each berth graphic dynamically correlating to the layout references.

## Open Questions

> [!IMPORTANT]
> The image exhibits pink/blue icons inside the booked seats denoting potentially gendered status. As our `Booking` database model presently only checks seat exclusivity without capturing distinct individual seat gender status at checkout, I will render these icons entirely neutrally for all standard bookings/locks. Does that sound acceptable for this phase?

## Verification Plan

### Automated Tests
- Verify `.seat` nodes dynamically attach proper lexical `currentSeat` IDs via simulated click events on Node testing.
- Assess Admin Token injection validity.

### Manual Verification
1. Access the real Admin portal, add a bus successfully to the database, and see it populate instantly on the live results page.
2. Select the bus and examine the exact matching structure: 2 Deck Side-by-Side split, vertical rectangular styling, separate ₹1050 vs ₹900 price tagging, and functional atomic locks.
