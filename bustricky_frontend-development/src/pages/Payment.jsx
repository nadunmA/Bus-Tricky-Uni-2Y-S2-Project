// src/pages/Payment.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  CreditCardIcon,
  LockIcon,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  // Receive data from SeatSelection
  const { route, travelDate, selectedSeats, passengerDetails } =
    location.state || {};

  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.id || parsed._id || null;
      }
      return null;
    } catch (err) {
      console.error("Error getting user ID:", err);
      return null;
    }
  };

  if (!route || !selectedSeats || !passengerDetails) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Booking Data Missing
          </h2>
          <p className="text-red-600 mb-4">
            Route or booking data not available. Please start your booking
            again.
          </p>
          <button
            onClick={() => navigate("/book-seats")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Booking
          </button>
        </div>
      </div>
    );
  }

  const pricePerSeat = route.price || 500;
  const totalAmount = selectedSeats.length * pricePerSeat;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e?.preventDefault();
    setError(null);

    // Validate card details if payment method is card
    if (paymentMethod === "card") {
      const { cardNumber, cardName, expiryDate, cvv } = cardDetails;
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setError("Please fill in all card details");
        return;
      }

      // Basic validation
      if (cardNumber.replace(/\s/g, "").length < 13) {
        setError("Invalid card number");
        return;
      }

      if (cvv.length < 3) {
        setError("Invalid CVV");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const userId = getUserId();

      // Prepare booking data
      const bookingData = {
        route: route._id || route.routeId,
        passenger: {
          userId: userId,
          name: passengerDetails.name,
          email: passengerDetails.email,
          phone: passengerDetails.phone,
        },
        seats: selectedSeats,
        totalAmount,
        paymentStatus: paymentMethod === "card" ? "Paid" : "Pending",
        date: travelDate,
      };

      console.log("Sending booking data:", bookingData);

      // Create booking in backend
      const response = await axios.post(
        "http://localhost:8000/api/bookings",
        bookingData
      );

      console.log("Booking response:", response.data);

      if (response.data.success && response.data.booking) {
        const newBooking = response.data.booking;

        // Simulate payment processing delay
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentComplete(true);

          // Redirect to E-Ticket with booking ID
          setTimeout(() => {
            navigate(`/e-ticket/${newBooking._id}`, {
              state: { booking: newBooking },
            });
          }, 2000);
        }, 1500);
      } else {
        throw new Error(response.data.message || "Failed to create booking");
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setIsProcessing(false);

      if (err.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to server. Please make sure the backend is running."
        );
      } else if (err.response) {
        setError(err.response.data.message || "Failed to create booking");
      } else {
        setError(
          err.message || "An error occurred while processing your payment"
        );
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Complete Your Payment
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {paymentComplete ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600">Redirecting to your e-ticket...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

            {/* Method Select */}
            <div className="mb-6 flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mr-2"
                />
                <CreditCardIcon size={18} className="mr-1 text-blue-600" />
                Credit Card
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="mr-2"
                />
                Cash on Pickup
              </label>
            </div>

            {paymentMethod === "card" && (
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={3}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-start text-sm text-gray-600 mt-2">
                  <LockIcon size={16} className="mr-2 text-green-600 mt-0.5" />
                  <span>Secure payment — your card details are encrypted.</span>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full mt-4 py-3 rounded-md font-semibold flex items-center justify-center ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now <ChevronRightIcon size={18} className="ml-1" />
                    </>
                  )}
                </button>
              </form>
            )}

            {paymentMethod === "cash" && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800">
                    You will pay in cash at the bus pickup point. Please arrive
                    15 minutes early for payment.
                  </p>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-md font-semibold flex items-center justify-center ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Cash Payment{" "}
                      <ChevronRightIcon size={18} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 h-fit">
            <h2 className="text-xl font-semibold mb-4 pb-3 border-b">
              Booking Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Passenger:</span>
                <p className="font-medium">{passengerDetails.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Route:</span>
                <p className="font-medium">
                  {route.from} → {route.to}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <p className="font-medium">{travelDate}</p>
              </div>
              <div>
                <span className="text-gray-600">Seats:</span>
                <p className="font-medium">
                  {selectedSeats.map((s) => s.name).join(", ")}
                </p>
              </div>
              <div className="pt-3 border-t">
                <span className="text-gray-600">Price per seat:</span>
                <p className="font-medium">
                  Rs. {pricePerSeat.toLocaleString()}
                </p>
              </div>
              <div className="pt-3 border-t">
                <span className="text-gray-600">Total Amount:</span>
                <p className="text-2xl font-bold text-blue-600">
                  Rs. {totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
