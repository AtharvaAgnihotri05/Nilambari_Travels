/* ============================================
   Nilambari Travels - Dummy Data & Shared State
   ============================================ */

// Cities
const CITIES = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Shirdi'];

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
  },
  {
    id: 2,
    name: 'Shivneri Deluxe',
    type: 'Non-AC Seater',
    departure: '08:30 AM',
    arrival: '03:30 PM',
    duration: '7h 0m',
    price: 450,
    totalSeats: 30,
    bookedSeats: [1, 5, 9, 14, 20, 22],
    rating: 4.2,
    amenities: ['Charging Point', 'Water Bottle']
  },
  {
    id: 3,
    name: 'Royal Traveller',
    type: 'AC Seater',
    departure: '10:00 PM',
    arrival: '05:00 AM',
    duration: '7h 0m',
    price: 600,
    totalSeats: 30,
    bookedSeats: [2, 6, 11, 16, 28],
    rating: 4.7,
    amenities: ['AC', 'Blanket', 'Charging Point', 'Snacks']
  },
  {
    id: 4,
    name: 'Comfort Liner',
    type: 'AC Sleeper',
    departure: '11:30 PM',
    arrival: '06:30 AM',
    duration: '7h 0m',
    price: 850,
    totalSeats: 30,
    bookedSeats: [4, 8, 15, 19, 23, 27],
    rating: 4.8,
    amenities: ['AC', 'WiFi', 'Blanket', 'Charging Point', 'Snacks', 'Entertainment']
  },
  {
    id: 5,
    name: 'Sahyadri Fast',
    type: 'Non-AC Seater',
    departure: '02:00 PM',
    arrival: '08:00 PM',
    duration: '6h 0m',
    price: 350,
    totalSeats: 30,
    bookedSeats: [10, 13, 21],
    rating: 3.9,
    amenities: ['Water Bottle']
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
  isAdminLoggedIn: false,

  // Save state to sessionStorage
  save() {
    sessionStorage.setItem('nilambariState', JSON.stringify({
      searchQuery: this.searchQuery,
      selectedBus: this.selectedBus,
      selectedSeats: this.selectedSeats,
      passengerDetails: this.passengerDetails,
      isAdminLoggedIn: this.isAdminLoggedIn
    }));
  },

  // Load state from sessionStorage
  load() {
    const stored = sessionStorage.getItem('nilambariState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        Object.assign(this, parsed);
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
  }
};

// Load state on script load
AppState.load();
