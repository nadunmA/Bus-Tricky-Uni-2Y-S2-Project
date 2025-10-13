import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BusIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  InfoIcon,
} from "lucide-react";
export function BookingDetails() {
  const { bookingId } = useParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundMethod, setRefundMethod] = useState("original");
  // In a real app, we would fetch the booking details from the backend
  // For now, we'll use a mockup booking
  const booking = {
    id: bookingId || "BK123456",
    busId: 1,
    busName: "Superline Express",
    route: {
      from: "Colombo",
      to: "Kandy",
    },
    date: "2023-07-15",
    departureTime: "07:30",
    arrivalTime: "11:00",
    seatNumbers: ["A3", "A4"],
    status: "Confirmed",
    paymentStatus: "Paid",
    amount: 1500,
    passengerDetails: {
      name: "John Perera",
      email: "john@example.com",
      phone: "+94 77 123 4567",
    },
    bookingDate: "2023-07-10T09:30:00",
    paymentMethod: "Credit Card",
  };
  const handleCancelBooking = () => {
    // In a real app, we would send a cancellation request to the backend
    // For now, just close the modal and show the refund modal
    setShowCancelModal(false);
    setShowRefundModal(true);
  };
  const handleProcessRefund = () => {
    // In a real app, we would process the refund
    // For now, just close the modal
    setShowRefundModal(false);
    alert(
      "Refund has been processed. You will receive the amount within 3-5 business days."
    );
  };
  const calculateCancellationFee = () => {
    // 10% cancellation fee
    return booking.amount * 0.1;
  };
  const calculateRefundAmount = () => {
    return booking.amount - calculateCancellationFee();
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/user-dashboard"
          className="inline-flex items-center text-blue-600 mb-6 hover:underline"
        >
          <ArrowLeftIcon size={16} className="mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-6">Booking Details</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Booking Status Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Booking #{booking.id}</h2>
                <p className="text-blue-100 mt-1">
                  Made on {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
              </div>
              <div className="px-4 py-2 bg-white text-blue-600 rounded-md font-semibold">
                {booking.status}
              </div>
            </div>
          </div>
          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Journey Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Journey Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <BusIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">Bus</div>
                      <div className="font-medium">{booking.busName}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">Route</div>
                      <div className="font-medium">
                        {booking.route.from} - {booking.route.to}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CalendarIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">Date</div>
                      <div className="font-medium">{booking.date}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">
                        Departure Time
                      </div>
                      <div className="font-medium">{booking.departureTime}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">Arrival Time</div>
                      <div className="font-medium">{booking.arrivalTime}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Passenger & Payment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Passenger & Payment Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <UserIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">
                        Passenger Name
                      </div>
                      <div className="font-medium">
                        {booking.passengerDetails.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <PhoneIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">Phone</div>
                      <div className="font-medium">
                        {booking.passengerDetails.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MailIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">Email</div>
                      <div className="font-medium">
                        {booking.passengerDetails.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CreditCardIcon
                      size={18}
                      className="mt-0.5 text-blue-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">
                        Payment Method
                      </div>
                      <div className="font-medium">{booking.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon
                      size={18}
                      className="mt-0.5 text-green-600 mr-3 flex-shrink-0"
                    />
                    <div>
                      <div className="text-gray-600 text-sm">
                        Payment Status
                      </div>
                      <div className="font-medium text-green-600">
                        {booking.paymentStatus}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Seat & Pricing Details */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">
                Seat & Pricing Details
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Seat Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Passenger
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {booking.seatNumbers.map((seat, index) => (
                      <tr key={seat}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {seat}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.passengerDetails.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rs.{" "}
                            {(
                              booking.amount / booking.seatNumbers.length
                            ).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td
                        colSpan={2}
                        className="px-6 py-4 whitespace-nowrap text-right font-medium"
                      >
                        Total Amount:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-blue-600">
                          Rs. {booking.amount.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Cancellation Policy */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">
                Cancellation Policy
              </h3>
              <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Cancellation is available up to 4 hours before the scheduled
                    departure time.
                  </li>
                  <li>
                    A 10% cancellation fee will be charged on the total booking
                    amount.
                  </li>
                  <li>
                    Refunds will be processed to the original payment method
                    within 3-5 business days.
                  </li>
                  <li>
                    For any assistance with cancellations, please contact our
                    customer support.
                  </li>
                </ul>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t flex flex-wrap gap-3">
              <Link
                to={`/e-ticket/${booking.id}`}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View E-Ticket
              </Link>
              <button className="px-6 py-2 border border-yellow-500 text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors">
                Change Seats
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your booking? A 10% cancellation
                fee will be charged.
              </p>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Reason for Cancellation (Optional)
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found better option">
                    Found better option
                  </option>
                  <option value="Personal emergency">Personal emergency</option>
                  <option value="Weather concerns">Weather concerns</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <div className="flex items-start">
                  <AlertCircleIcon
                    size={20}
                    className="text-red-600 mt-0.5 mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-medium text-red-800">
                      Cancellation Details:
                    </h4>
                    <ul className="text-red-700 text-sm mt-1 space-y-1">
                      <li>
                        • Booking Amount: Rs. {booking.amount.toLocaleString()}
                      </li>
                      <li>
                        • Cancellation Fee (10%): Rs.{" "}
                        {calculateCancellationFee().toLocaleString()}
                      </li>
                      <li>
                        • Refund Amount: Rs.{" "}
                        {calculateRefundAmount().toLocaleString()}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Process Refund</h3>
              <p className="text-gray-600 mb-4">
                Your booking has been cancelled. Please select your preferred
                refund method.
              </p>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Refund Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="refundMethod"
                      value="original"
                      checked={refundMethod === "original"}
                      onChange={() => setRefundMethod("original")}
                      className="mr-2"
                    />
                    <span>Refund to Original Payment Method (Credit Card)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="refundMethod"
                      value="wallet"
                      checked={refundMethod === "wallet"}
                      onChange={() => setRefundMethod("wallet")}
                      className="mr-2"
                    />
                    <span>Add to Wallet Balance (Instant)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="refundMethod"
                      value="bank"
                      checked={refundMethod === "bank"}
                      onChange={() => setRefundMethod("bank")}
                      className="mr-2"
                    />
                    <span>Bank Transfer (Additional details required)</span>
                  </label>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <div className="flex items-start">
                  <InfoIcon
                    size={20}
                    className="text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-medium text-blue-800">
                      Refund Information:
                    </h4>
                    <ul className="text-blue-700 text-sm mt-1 space-y-1">
                      <li>
                        • Refund Amount: Rs.{" "}
                        {calculateRefundAmount().toLocaleString()}
                      </li>
                      <li>
                        • Processing Time: 3-5 business days for card refunds,
                        instant for wallet
                      </li>
                      <li>
                        • You will receive a confirmation email once the refund
                        is processed
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessRefund}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
