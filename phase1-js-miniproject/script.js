let parkingSpots = [];
let currentSelectedSpot = null;
let categoryFilter = 'all';

async function loadParkingSpots() {
  showStatus('Loading parking spots...');
  try {
    const response = await fetch('data/parkingLotSeed.json');
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    parkingSpots = mergeWithSavedBookings(data);

    categoryFilter = loadFilterFromSession();
    document.getElementById('category-filter').value = categoryFilter;

    refreshDisplay();
    showStatus(`Loaded ${parkingSpots.length} spots.`);
  } catch (error) {
    showStatus('Failed to load parking data. Please refresh.');
    console.error(error);
  }
}

function mergeWithSavedBookings(spots) {
  const savedBookings = JSON.parse(localStorage.getItem('bookings')) || {};

  return spots.map((spot) => {
    if (savedBookings[spot.spotNumber]) {
      return {
        ...spot,
        status: 'booked',
        bookingDetails: savedBookings[spot.spotNumber]
      };
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

function saveFilterToSession(filter) {
  sessionStorage.setItem('categoryFilter', filter);
}

function loadFilterFromSession() {
  return sessionStorage.getItem('categoryFilter') || 'all';
}

function renderGrid(spots) {
  const gridEl = document.getElementById('parking-grid');
  gridEl.innerHTML = '';

  for (const spot of spots) {
    const spotDiv = document.createElement('div');
    spotDiv.className = `spot ${spot.status}`;
    spotDiv.dataset.spotNumber = spot.spotNumber;

    spotDiv.innerHTML = `
      <span>${spot.spotNumber}</span>
      <span class="category">${spot.category}</span>
    `;

    spotDiv.addEventListener('click', () => handleSpotClick(spot));

    gridEl.appendChild(spotDiv);
  }

  updateSummary(spots);
}

function updateSummary(spots) {
  const available = spots.filter((s) => s.status === 'available').length;
  const booked = spots.filter((s) => s.status === 'booked').length;
  document.getElementById('summary').textContent =
    `${available} Available | ${booked} Booked | Total: ${spots.length}`;
}

function updateRevenue() {
  const total = parkingSpots
    .filter((spot) => spot.bookingDetails)
    .reduce((sum, spot) => sum + spot.bookingDetails.amount, 0);

  document.getElementById('revenue').textContent = `Total Revenue: ₹${total}`;
}

function getFilteredSpots() {
  if (categoryFilter === 'all') {
    return parkingSpots;
  }
  return parkingSpots.filter((spot) => spot.category === categoryFilter);
}

function refreshDisplay() {
  renderGrid(getFilteredSpots());
  updateSummary(parkingSpots);
  updateRevenue();
}

document.getElementById('category-filter').addEventListener('change', function (e) {
  categoryFilter = e.target.value;
  saveFilterToSession(categoryFilter);
  refreshDisplay();
});

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
  document.getElementById('booking-form').reset();
}

document.getElementById('booking-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('input-name').value.trim();
  const vehicleNumber = document.getElementById('input-vehicle').value.trim().toUpperCase();
  const duration = Number(document.getElementById('input-duration').value);

  const errorEl = document.getElementById('form-error');
  errorEl.textContent = '';

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

function calculateAmount(pricePerHour, duration) {
  return pricePerHour * duration;
}

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

function releaseSpot() {
  const spotNumber = currentSelectedSpot.spotNumber;
  const spot = parkingSpots.find((s) => s.spotNumber === spotNumber);

  spot.status = 'available';
  delete spot.bookingDetails;
  removeBookingFromStorage(spotNumber);

  closeModal();
  refreshDisplay();
  showStatus(`Spot ${spotNumber} released.`);
}

function showStatus(message) {
  document.getElementById('status-message').textContent = message;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('release-btn').addEventListener('click', releaseSpot);

loadParkingSpots();