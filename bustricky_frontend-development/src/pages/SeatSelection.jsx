// src/pages/SeatSelection.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BusIcon, InfoIcon, ChevronRightIcon } from "lucide-react";

export function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get route object from location.state
  const route = location.state?.route || null;
  const travelDate = searchParams.get("date") || "";

  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  // ✅ Move useEffect BEFORE any conditional returns
  useEffect(() => {
    const rows = 10;
    const cols = 4;
    const layout = [];
    let seatNumber = 1;

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        if (c === 2) {
          row.push(null); // aisle
        } else {
          const seatName = `S${seatNumber}`;
          row.push({
            id: seatNumber,
            name: seatName,
            status: "available",
          });
          seatNumber++;
        }
      }
      layout.push(row);
    }
    setSeatLayout(layout);
  }, []);

  // ✅ NOW you can have conditional returns
  if (!route) {
    return (
      <p className="text-center py-10 text-red-500">
        Route data not available.
      </p>
    );
  }

  const handleSeatClick = (seat) => {
    if (!seat || seat.status === "booked") return;
    setSelectedSeats((prev) =>
      prev.some((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPassengerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0)
      return alert("Please select at least one seat");
    if (
      !passengerDetails.name ||
      !passengerDetails.email ||
      !passengerDetails.phone
    )
      return alert("Please fill in all passenger details");

    // Navigate to Payment page with route object and booking info
    navigate(`/payment/${Date.now()}`, {
      state: {
        // userId: sessionStorage.getItem("userId"),
        route,
        travelDate,
        selectedSeats,
        passengerDetails,
      },
    });
  };

  const pricePerSeat = route.price || 500;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Your Seats</h1>

      {/* Route Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <BusIcon size={20} className="mr-2 text-blue-600" />
              {route.from} → {route.to}
            </h2>
            <p className="text-gray-700 mt-2">
              Distance: {route.distance} km | Duration: {route.duration} hrs
            </p>
            <p className="text-gray-700 mt-1">
              Price per seat: Rs. {pricePerSeat.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              <span className="font-medium">Date:</span> {travelDate}
            </p>
          </div>
        </div>
      </div>

      {/* Seat Layout & Booking Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seats */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Bus Seat Layout</h2>

          <div className="flex space-x-6 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div> Available
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div> Selected
            </div>
          </div>

          {/* Driver Cabin */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-sm">
              Driver
            </div>
          </div>

          {/* Seats */}
          <div className="space-y-2">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-2">
                {row.map((seat, seatIndex) =>
                  seat === null ? (
                    <div
                      key={`aisle-${rowIndex}-${seatIndex}`}
                      className="w-6"
                    />
                  ) : (
                    <button
                      key={seat.id}
                      className={`w-10 h-10 rounded flex items-center justify-center text-sm ${
                        selectedSeats.some((s) => s.id === seat.id)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat.name}
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-6 text-sm text-gray-500">
            Front of Bus
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
          <div className="mb-6">
            <p>
              <b>Selected Seats:</b>{" "}
              {selectedSeats.length
                ? selectedSeats.map((s) => s.name).join(", ")
                : "None"}
            </p>
            <p>
              <b>Price per Seat:</b> Rs. {pricePerSeat.toLocaleString()}
            </p>
            <p>
              <b>Total:</b> Rs.{" "}
              {(selectedSeats.length * pricePerSeat).toLocaleString()}
            </p>
          </div>

          {/* Passenger Details */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Passenger Details</h3>
            <input
              type="text"
              name="name"
              value={passengerDetails.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="email"
              name="email"
              value={passengerDetails.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="tel"
              name="phone"
              value={passengerDetails.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={saving || selectedSeats.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold flex justify-center items-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Proceed to Payment <ChevronRightIcon size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
