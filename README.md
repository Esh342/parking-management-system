# Smart Car Parking System

A web-based parking management system that gives drivers a live, visual map of parking spot availability — modeled on **Elante Mall, Chandigarh**, one of North India's largest malls, with multi-level basement parking serving the tricity region (Chandigarh, Panchkula, Mohali).

**Team:** Arsh, Bhavana, Deeya, Esh

## Problem
Manual parking management leads to wasted time, disputes over spot availability, and zero visibility into occupancy — a driver has no idea if a lot is full until they've already driven in. Elante Mall's basement parking (6,000+ four-wheeler capacity across 3 floors) is a real example of the scale this problem exists at.

## Solution
This project provides a live digital map of a parking facility. Every spot is visually color-coded by status (available / booked), organized by category (general, reserved, EV charging, valet) and entrance gate — mirroring how Elante's real parking is structured. Users can book a spot directly, view booking details, and check out — with the map updating instantly.

*(Scope note: the working demo simulates one basement floor — 50 spots — modeled on Elante's Basement Level 1, not the full real capacity.)*

## Features
- **Live parking map** — 50 spots laid out in a grid, color-coded by availability
- **Category-based organization** — General, Reserved, EV, and Valet spots, each with different pricing
- **Booking flow** — click an available spot, enter vehicle details, confirm — the spot updates instantly and the amount is calculated automatically
- **Checkout/release** — click a booked spot to view its details and release it
- **Filter by category** — narrow the map down to just EV spots, reserved spots, etc.
- **Nearest-gate finder** — find the closest available spot to either entrance gate with one click
- **Revenue tracker** — live running total of revenue from all current bookings
- **Persistent bookings** — your bookings are saved and survive a page refresh

## Tech Stack
HTML, CSS, JavaScript (DOM manipulation, Fetch API, async/await, localStorage/sessionStorage)

*(This is the client-side foundation of the project. A full backend — Node.js, Express, MongoDB, JWT authentication, and real-time updates via Socket.io — is being layered in as the next phase of development.)*

## How to Run
1. Open this folder in VS Code
2. Right-click `index.html` → **"Open with Live Server"**
3. Click any green (available) spot to book it, or a yellow (booked) spot to view/release it

## File Structure
```
├── index.html    → page structure (grid, booking modal, controls)
├── style.css     → styling and color-coded spot states
├── script.js     → all application logic
└── data/
    └── parkingLotSeed.json  → sample parking lot data (50 spots)
```

## Team Contributions
- **Arsh:** Database & schema design, parking lot data
- **Bhavana:** Core application logic — data fetching, rendering, booking flow
- **Deeya:** Styling, category filtering, nearest-gate finder, revenue tracking
- **Esh:** Documentation, repository management, testing

## What's Next
The next phase replaces the current localStorage-based data layer with a full backend (Node.js, Express, MongoDB) and adds real-time synchronization via Socket.io, JWT-based user authentication, dynamic pricing, and an admin analytics dashboard.
