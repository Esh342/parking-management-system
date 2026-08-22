// ============================================================
// SMART CAR PARKING SYSTEM — JavaScript Mini Project (CA-1)
// Every function below is labeled with the exact lecture topic
// it demonstrates, so any team member can explain it directly.
// ============================================================

// ---- Variables & Data Types (Lec 1-2) ----
let parkingSpots = [];        // array of spot objects, filled after fetch
let currentSelectedSpot = null; // tracks which spot is open in the modal
let categoryFilter = 'all';   // tracks the currently selected category filter

// ============================================================
// Lec 27-28: Async/Await, Fetch API, REST API Consumption, JSON Handling
// ============================================================
async function loadParkingSpots() {
  showStatus('Loading parking spots...');
  try {
    const response = await fetch('data/parkingLotSeed.json'); // Fetch API
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`); // Error Handling (Lec 25-26)
    }
    const data = await response.json(); // JSON Handling
    parkingSpots = mergeWithSavedBookings(data);

    // Lec 23: Session Storage — restore the last-used filter for this browser tab/session
    categoryFilter = loadFilterFromSession();
    document.getElementById('category-filter').value = categoryFilter;

    refreshDisplay();
    showStatus(`Loaded ${parkingSpots.length} spots.`);
  } catch (error) {
    showStatus('Failed to load parking data. Please refresh.');
    console.error(error);
  }
}

// ============================================================
// Lec 23: Local Storage — acts as our "database" for CA-1
// ============================================================
function mergeWithSavedBookings(spots) {
  const savedBookings = JSON.parse(localStorage.getItem('bookings')) || {};

  // Lec 13-14: Higher Order Function (map) + Lec 24: Spread operator
  return spots.map((spot) => {
    if (savedBookings[spot.spotNumber]) {
      return { ...spot, status: 'booked', bookingDetails: savedBookings[spot.spotNumber] };
    }
    return spot;
  });
}

function saveBookingToStorage(spotNumber, bookingDetails) {
  const savedBookings = JSON.parse(localStorage.getItem('bookings')) || {};
  savedBookings[spotNumber] = bookingDetails;
  localStorage.setItem('bookings', JSON.stringify(savedBookings));
}

function removeBookingFromStorage(spotNumber) {
  const savedBookings = JSON.parse(localStorage.getItem('bookings')) || {};
  delete savedBookings[spotNumber];
  localStorage.setItem('bookings', JSON.stringify(savedBookings));
}

// ============================================================
// Lec 23: Session Storage — remembers the filter only for this
// browser tab/session (clears automatically when the tab closes,
// unlike localStorage which stays forever)
// ============================================================
function saveFilterToSession(filter) {
  sessionStorage.setItem('categoryFilter', filter);
}

function loadFilterFromSession() {
  return sessionStorage.getItem('categoryFilter') || 'all';
}

// ============================================================
// Lec 17-20: DOM Introduction + DOM Manipulation
// ============================================================
function renderGrid(spots) {
  const gridEl = document.getElementById('parking-grid'); // querySelector-style DOM selection
  gridEl.innerHTML = ''; // clearing existing elements

  // Lec 5-6: Loop (for...of)
  for (const spot of spots) {
    const spotDiv = document.createElement('div'); // creating elements
    spotDiv.className = `spot ${spot.status}`; // Lec 24: Template literal
    spotDiv.dataset.spotNumber = spot.spotNumber; // used later to find & highlight this spot

    spotDiv.innerHTML = `
      <span>${spot.spotNumber}</span>
      <span class="category">${spot.category}</span>
    `;

    // Lec 21: Event Handling
    spotDiv.addEventListener('click', () => handleSpotClick(spot));

    gridEl.appendChild(spotDiv);
  }

  updateSummary(spots);
}

// ============================================================
// Lec 13-14: Higher Order Functions (filter)
// ============================================================
function updateSummary(spots) {
  const available = spots.filter((s) => s.status === 'available').length;
  const booked = spots.filter((s) => s.status === 'booked').length;
  document.getElementById('summary').textContent =
    `${available} Available | ${booked} Booked | Total: ${spots.length}`;
}

// ============================================================
// Lec 13-14: Higher Order Function (reduce) — adds up the amount
// from every currently booked spot to show total revenue collected
// ============================================================
function updateRevenue() {
  const total = parkingSpots
    .filter((spot) => spot.bookingDetails)
    .reduce((sum, spot) => sum + spot.bookingDetails.amount, 0);

  document.getElementById('revenue').textContent = `Total Revenue: ₹${total}`;
}

// ============================================================
// Category Filter — uses .filter() (Lec 13-14) on the full
// parkingSpots array; the underlying data never changes, only
// what's shown on screen changes
// ============================================================
function getFilteredSpots() {
  if (categoryFilter === 'all') {
    return parkingSpots;
  }
  return parkingSpots.filter((spot) => spot.category === categoryFilter);
}

// One helper that keeps the grid, summary, and revenue all in sync
// so we don't have to remember to call three functions every time
function refreshDisplay() {
  renderGrid(getFilteredSpots());
  updateSummary(parkingSpots); // overall stats, independent of the filter
  updateRevenue();
}

document.getElementById('category-filter').addEventListener('change', function (e) {
  categoryFilter = e.target.value;
  saveFilterToSession(categoryFilter); // Lec 23: Session Storage
  refreshDisplay();
});

// ============================================================
// Nearest-Gate Finder — uses .filter() then .sort() (Lec 13-14)
// to find the closest available spot to a given entrance gate
// ============================================================
function findNearestSpot(gate) {
  const availableAtGate = parkingSpots.filter(
    (spot) => spot.status === 'available' && spot.nearestGate === gate
  );

  if (availableAtGate.length === 0) {
    showStatus(`No available spots near ${gate}.`);
    return;
  }

  // Gate A is closest to column 1, Gate B is closest to column 10
  const anchorColumn = gate === 'gateA' ? 1 : 10;

  availableAtGate.sort((a, b) => {
    const distanceA = Math.abs(a.column - anchorColumn);
    const distanceB = Math.abs(b.column - anchorColumn);
    return distanceA - distanceB; // smallest distance first
  });

  const nearest = availableAtGate[0];
  showStatus(`Nearest available spot to ${gate}: ${nearest.spotNumber} (${nearest.category})`);
  highlightSpot(nearest.spotNumber);
}

function highlightSpot(spotNumber) {
  // remove any previous highlight first
  document.querySelectorAll('.spot.highlight').forEach((el) => el.classList.remove('highlight'));

  const target = document.querySelector(`.spot[data-spot-number="${spotNumber}"]`);
  if (target) {
    target.classList.add('highlight');
    setTimeout(() => target.classList.remove('highlight'), 3000); // remove after 3 seconds
  }
}

document.getElementById('find-gateA-btn').addEventListener('click', () => findNearestSpot('gateA'));
document.getElementById('find-gateB-btn').addEventListener('click', () => findNearestSpot('gateB'));

// ============================================================
// Lec 3-4: Conditional Statements + Lec 21: Event Handling
// ============================================================
function handleSpotClick(spot) {
  currentSelectedSpot = spot;

  if (spot.status === 'available') {
    openBookingView(spot);
  } else {
    openDetailsView(spot);
  }
}

function openBookingView(spot) {
  document.getElementById('booking-view').classList.remove('hidden');
  document.getElementById('details-view').classList.add('hidden');
  document.getElementById('booking-modal').classList.remove('hidden');

  document.getElementById('modal-spot-number').textContent = spot.spotNumber;
  document.getElementById('modal-price').textContent = spot.pricePerHour;
}

function openDetailsView(spot) {
  document.getElementById('booking-view').classList.add('hidden');
  document.getElementById('details-view').classList.remove('hidden');
  document.getElementById('booking-modal').classList.remove('hidden');

  const b = spot.bookingDetails;
  document.getElementById('detail-spot-number').textContent = spot.spotNumber;
  document.getElementById('detail-name').textContent = b.name;
  document.getElementById('detail-vehicle').textContent = b.vehicleNumber;
  document.getElementById('detail-duration').textContent = b.duration;
  document.getElementById('detail-amount').textContent = b.amount;
  document.getElementById('detail-time').textContent = b.bookedAt;
}

function closeModal() {
  document.getElementById('booking-modal').classList.add('hidden');
  document.getElementById('booking-form').reset(); // Lec 22: Forms
}

// ============================================================
// Lec 21-22: Forms, Form Validation, preventDefault, Error Messages
// ============================================================
document.getElementById('booking-form').addEventListener('submit', function (e) {
  e.preventDefault(); // Event Object method

  const name = document.getElementById('input-name').value.trim();
  const vehicleNumber = document.getElementById('input-vehicle').value.trim().toUpperCase();
  const duration = Number(document.getElementById('input-duration').value); // Lec 3-4: Type Conversion

  const errorEl = document.getElementById('form-error');
  errorEl.textContent = '';

  // Form validation
  if (!name || !vehicleNumber || !duration) {
    errorEl.textContent = 'All fields are required.';
    return;
  }
  if (duration <= 0 || duration > 24) {
    errorEl.textContent = 'Duration must be between 1 and 24 hours.';
    return;
  }

  confirmBooking(name, vehicleNumber, duration);
});

// ============================================================
// Lec 7-8: Functions, Parameters, Arguments, Return Values
// ============================================================
function calculateAmount(pricePerHour, duration) {
  return pricePerHour * duration;
}

// Lec 15-16: Objects, Properties, Nested Objects
function confirmBooking(name, vehicleNumber, duration) {
  const spot = currentSelectedSpot;
  const amount = calculateAmount(spot.pricePerHour, duration);

  const bookingDetails = {
    name,
    vehicleNumber,
    duration,
    amount,
    bookedAt: new Date().toLocaleString(),
  };

  spot.status = 'booked';
  spot.bookingDetails = bookingDetails;

  saveBookingToStorage(spot.spotNumber, bookingDetails);

  closeModal();
  refreshDisplay();
  showStatus(`Spot ${spot.spotNumber} booked for ${vehicleNumber}. Amount: ₹${amount}`);
}

// ============================================================
// Checkout / Release — Lec 9-12: Arrays, Array Methods (find)
// ============================================================
function releaseSpot() {
  const spotNumber = currentSelectedSpot.spotNumber;
  const spot = parkingSpots.find((s) => s.spotNumber === spotNumber); // Array method: find

  spot.status = 'available';
  delete spot.bookingDetails;
  removeBookingFromStorage(spotNumber);

  closeModal();
  refreshDisplay();
  showStatus(`Spot ${spotNumber} released.`);
}

// ---- Utility ----
function showStatus(message) {
  document.getElementById('status-message').textContent = message;
}

// ---- Wiring up static event listeners ----
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('release-btn').addEventListener('click', releaseSpot);

// ---- Init: load data as soon as the page opens ----
loadParkingSpots();
