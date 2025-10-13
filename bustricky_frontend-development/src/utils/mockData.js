// Sri Lankan cities and towns
export const locations = [
  "Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Trincomalee",
  "Batticaloa", "Anuradhapura", "Polonnaruwa", "Matara", "Nuwara Eliya",
  "Kurunegala", "Ratnapura", "Badulla", "Hambantota", "Matale", "Kalmunai",
  "Vavuniya", "Puttalam", "Kegalle", "Ampara", "Kilinochchi", "Mannar",
  "Mullaitivu", "Hatton", "Dambulla", "Beruwala", "Chilaw", "Kalutara", "Panadura"
];

// Popular bus routes with prices and images
export const routes = [
  {
    id: 1,
    from: "Colombo",
    to: "Kandy",
    distance: "115 km",
    duration: "3h 30m",
    price: 750,
    image: "/images/kandy.jpg"
  },
  {
    id: 2,
    from: "Colombo",
    to: "Galle",
    distance: "125 km",
    duration: "2h 45m",
    price: 650,
    image: "/images/colombo-galle.jpg"
  },
  {
    id: 3,
    from: "Colombo",
    to: "Jaffna",
    distance: "395 km",
    duration: "7h 30m",
    price: 1800,
    image: "/images/colombo-jaffna.jpg"
  },
  {
    id: 4,
    from: "Kandy",
    to: "Nuwara Eliya",
    distance: "76 km",
    duration: "2h 30m",
    price: 550,
    image: "/images/kandy-nuwara.jpg"
  },
  {
    id: 5,
    from: "Galle",
    to: "Matara",
    distance: "42 km",
    duration: "1h 15m",
    price: 350,
    image: "/images/galle-matara.jpg"
  },
  {
    id: 6,
    from: "Colombo",
    to: "Negombo",
    distance: "38 km",
    duration: "1h",
    price: 250,
    image: "/images/colombo-negombo.jpg"
  },
  {
    id: 7,
    from: "Colombo",
    to: "Anuradhapura",
    distance: "200 km",
    duration: "4h 30m",
    price: 950,
    image: "/images/colombo-anuradhapura.jpg"
  },
  {
    id: 8,
    from: "Kandy",
    to: "Colombo",
    distance: "115 km",
    duration: "3h 30m",
    price: 750,
    image: "/images/kandy-colombo.jpg"
  }
];

// Available buses
export const buses = [
  {
    id: 1,
    name: "Superline Express",
    route: { from: "Colombo", to: "Kandy" },
    departureTime: "07:30",
    arrivalTime: "11:00",
    type: "Luxury",
    price: 750,
    availableSeats: 24,
    totalSeats: 40,
    facilities: ["AC", "WiFi", "USB Charging", "Reclining Seats"]
  },
  {
    id: 2,
    name: "Southern Riders",
    route: { from: "Colombo", to: "Galle" },
    departureTime: "08:15",
    arrivalTime: "11:00",
    type: "Semi-Luxury",
    price: 650,
    availableSeats: 18,
    totalSeats: 45,
    facilities: ["AC", "WiFi"]
  },
  {
    id: 3,
    name: "Northern Star",
    route: { from: "Colombo", to: "Jaffna" },
    departureTime: "21:00",
    arrivalTime: "04:30",
    type: "Super Luxury",
    price: 1800,
    availableSeats: 32,
    totalSeats: 36,
    facilities: ["AC", "WiFi", "USB Charging", "Reclining Seats", "Snacks", "Water"]
  },
  {
    id: 4,
    name: "Hill Country Express",
    route: { from: "Kandy", to: "Nuwara Eliya" },
    departureTime: "09:30",
    arrivalTime: "12:00",
    type: "Luxury",
    price: 550,
    availableSeats: 15,
    totalSeats: 40,
    facilities: ["AC", "USB Charging", "Reclining Seats"]
  },
  {
    id: 5,
    name: "Coastal Line",
    route: { from: "Galle", to: "Matara" },
    departureTime: "10:00",
    arrivalTime: "11:15",
    type: "Normal",
    price: 350,
    availableSeats: 30,
    totalSeats: 52,
    facilities: ["Standard Seating"]
  }
];

// Mockup bookings
export const bookings = [
  {
    id: "BK123456",
    userId: "U1001",
    busId: 1,
    busName: "Superline Express",
    route: { from: "Colombo", to: "Kandy" },
    date: "2023-06-15",
    departureTime: "07:30",
    arrivalTime: "11:00",
    seatNumbers: ["A3", "A4"],
    status: "Confirmed",
    paymentStatus: "Paid",
    amount: 1500,
    passengerDetails: { name: "John Perera", email: "john@example.com", phone: "+94 77 123 4567" },
    bookingDate: "2023-06-10T09:30:00"
  },
  {
    id: "BK123457",
    userId: "U1001",
    busId: 3,
    busName: "Northern Star",
    route: { from: "Colombo", to: "Jaffna" },
    date: "2023-06-20",
    departureTime: "21:00",
    arrivalTime: "04:30",
    seatNumbers: ["B7"],
    status: "Confirmed",
    paymentStatus: "Paid",
    amount: 1800,
    passengerDetails: { name: "John Perera", email: "john@example.com", phone: "+94 77 123 4567" },
    bookingDate: "2023-06-12T14:45:00"
  }
];

// Generate a seat layout for buses
export const generateSeatLayout = (busId) => {
  const bus = buses.find(b => b.id === busId);
  if (!bus) return null;

  const totalSeats = bus.totalSeats;
  const rows = Math.ceil(totalSeats / 4); // 4 seats per row
  const allSeatPositions = [];

  for (let row = 1; row <= rows; row++) {
    allSeatPositions.push(`A${row}`, `B${row}`, `C${row}`, `D${row}`);
  }

  const occupiedSeatsCount = totalSeats - bus.availableSeats;
  const shuffled = [...allSeatPositions].sort(() => 0.5 - Math.random());
  const occupiedSeats = shuffled.slice(0, occupiedSeatsCount);

  const seatLayout = [];
  for (let row = 1; row <= rows; row++) {
    const rowSeats = [
      { id: `A${row}`, name: `A${row}`, status: occupiedSeats.includes(`A${row}`) ? 'occupied' : 'available', position: 'window' },
      { id: `B${row}`, name: `B${row}`, status: occupiedSeats.includes(`B${row}`) ? 'occupied' : 'available', position: 'aisle' },
      null, // aisle
      { id: `C${row}`, name: `C${row}`, status: occupiedSeats.includes(`C${row}`) ? 'occupied' : 'available', position: 'aisle' },
      { id: `D${row}`, name: `D${row}`, status: occupiedSeats.includes(`D${row}`) ? 'occupied' : 'available', position: 'window' },
    ];
    seatLayout.push(rowSeats);
  }

  return seatLayout;
};
