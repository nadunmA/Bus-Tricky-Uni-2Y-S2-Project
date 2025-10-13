import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BusIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  TicketIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { jsPDF } from "jspdf";

export function ETicket() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const bookingFromState = location.state?.booking;

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingFromState) {
        setBooking(bookingFromState);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:8000/api/bookings/${bookingId}`
        );
        if (response.data.success && response.data.booking) {
          setBooking(response.data.booking);
        } else {
          throw new Error("Booking not found");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load booking details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBooking();
    else {
      setError("No booking ID provided");
      setLoading(false);
    }
  }, [bookingId, bookingFromState]);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const handleDownloadPDF = async () => {
    if (!booking) return;

    try {
      setDownloading(true);
      const doc = new jsPDF();
      let y = 20;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("BusTricky E-Ticket", 70, y);
      y += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Booking ID: ${booking.bookingId || booking._id}`, 14, y);
      y += 10;

      doc.text(`Status: ${booking.paymentStatus}`, 14, y);
      y += 10;

      doc.line(14, y, 196, y);
      y += 10;

      // Journey Details
      doc.setFont("helvetica", "bold");
      doc.text("🚌 Journey Details", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.text(`From: ${booking.route?.from || "N/A"}`, 14, y);
      y += 8;
      doc.text(`To: ${booking.route?.to || "N/A"}`, 14, y);
      y += 8;
      doc.text(`Date: ${formatDate(booking.date)}`, 14, y);
      y += 8;
      doc.text(
        `Departure Time: ${booking.route?.departureTime || "As per schedule"}`,
        14,
        y
      );
      y += 10;

      doc.line(14, y, 196, y);
      y += 10;

      // Passenger Details
      doc.setFont("helvetica", "bold");
      doc.text("👤 Passenger Details", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${booking.passenger?.name || "N/A"}`, 14, y);
      y += 8;
      doc.text(`Email: ${booking.passenger?.email || "N/A"}`, 14, y);
      y += 8;
      doc.text(`Phone: ${booking.passenger?.phone || "N/A"}`, 14, y);
      y += 10;

      doc.line(14, y, 196, y);
      y += 10;

      // Seat Details
      doc.setFont("helvetica", "bold");
      doc.text("💺 Seat Details", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      if (booking.seats?.length) {
        doc.text(
          `Selected Seats: ${booking.seats.map((s) => s.name).join(", ")}`,
          14,
          y
        );
      } else {
        doc.text("Selected Seats: N/A", 14, y);
      }
      y += 10;

      doc.line(14, y, 196, y);
      y += 10;

      // Payment Summary
      doc.setFont("helvetica", "bold");
      doc.text("💳 Payment Summary", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.text(`No. of Seats: ${booking.seats?.length || 0}`, 14, y);
      y += 8;
      doc.text(
        `Price per Seat: Rs. ${(booking.route?.price || 0).toLocaleString()}`,
        14,
        y
      );
      y += 8;
      doc.text(
        `Total Amount: Rs. ${(booking.totalAmount || 0).toLocaleString()}`,
        14,
        y
      );
      y += 10;

      doc.line(14, y, 196, y);
      y += 10;

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text(
        "Please arrive at the boarding point 15 minutes before departure.",
        14,
        y
      );
      y += 6;
      doc.text(
        `Booked on: ${formatDate(booking.bookingDate || booking.createdAt)} at ${formatTime(
          booking.bookingDate || booking.createdAt
        )}`,
        14,
        y
      );
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        "For cancellations or inquiries, contact BusTricky Support at support@bustricky.com",
        14,
        y
      );

      doc.save(`e-ticket-${booking.bookingId || bookingId}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading your e-ticket...</p>
      </div>
    );

  if (error || !booking)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || "We couldn’t find your booking details."}
          </p>
          <button
            onClick={() => navigate("/book-seats")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Book New Trip
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/user/userprofile")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to Profile
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>

        {/* Display details on screen (for reference) */}
        <div>
          <h1 className="text-2xl font-bold mb-4 flex items-center">
            <TicketIcon className="w-6 h-6 mr-2 text-blue-600" /> E-Ticket
          </h1>
          <p>
            <strong>Booking ID:</strong> {booking.bookingId || booking._id}
          </p>
          <p>
            <strong>Status:</strong> {booking.paymentStatus}
          </p>
          <hr className="my-4" />
          <p>
            <strong>From:</strong> {booking.route?.from} →{" "}
            <strong>To:</strong> {booking.route?.to}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(booking.date)} |{" "}
            <strong>Departure:</strong>{" "}
            {booking.route?.departureTime || "As per schedule"}
          </p>
          <hr className="my-4" />
          <p>
            <strong>Passenger:</strong> {booking.passenger?.name}
          </p>
          <p>
            <strong>Email:</strong> {booking.passenger?.email}
          </p>
          <p>
            <strong>Phone:</strong> {booking.passenger?.phone}
          </p>
          <hr className="my-4" />
          <p>
            <strong>Seats:</strong>{" "}
            {booking.seats?.map((s) => s.name).join(", ") || "N/A"}
          </p>
          <p>
            <strong>Total:</strong> Rs.{" "}
            {(booking.totalAmount || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
