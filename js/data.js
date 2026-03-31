/* ============================================
   Nilambari Travels - Dummy Data & Shared State
   ============================================ */

// Cities
const CITIES = ['Pune', 'Akola'];

// Bus Data
const BUSES = [
  {
    id: 1,
    name: 'Nilambari Express',
    type: 'AC Sleeper',
    departure: '06:00 AM',
    arrival: '12:00 PM',
    duration: '6h 0m',
    price: 750,
    totalSeats: 30,
    bookedSeats: [3, 7, 12, 18, 25],
    rating: 4.5,
    amenities: ['AC', 'WiFi', 'Charging Point']
  }
];

// Shared Application State
const AppState = {
  searchQuery: {
    source: '',
    destination: '',
    date: ''
  },
  selectedBus: null,
  selectedSeats: [],
  passengerDetails: {
    name: '',
    phone: ''
  },

  // Admin auth is now derived from JWT token
  get isAdminLoggedIn() {
    return !!localStorage.getItem('adminToken');
  },

  // Save state to sessionStorage
  save() {
    sessionStorage.setItem('nilambariState', JSON.stringify({
      searchQuery: this.searchQuery,
      selectedBus: this.selectedBus,
      selectedSeats: this.selectedSeats,
      passengerDetails: this.passengerDetails
    }));
  },

  // Load state from sessionStorage
  load() {
    const stored = sessionStorage.getItem('nilambariState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.searchQuery) this.searchQuery = parsed.searchQuery;
        if (parsed.selectedBus) this.selectedBus = parsed.selectedBus;
        if (parsed.selectedSeats) this.selectedSeats = parsed.selectedSeats;
        if (parsed.passengerDetails) this.passengerDetails = parsed.passengerDetails;
      } catch (e) {
        console.warn('Failed to load state:', e);
      }
    }
  },

  // Reset booking state
  resetBooking() {
    this.selectedBus = null;
    this.selectedSeats = [];
    this.passengerDetails = { name: '', phone: '' };
    this.save();
  },

  // Logout admin
  adminLogout() {
    localStorage.removeItem('adminToken');
  }
};

// Load state on script load
AppState.load();

