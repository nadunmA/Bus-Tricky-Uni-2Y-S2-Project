import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  BellIcon,
  LogOutIcon,
  SettingsIcon,
  AlertCircle,
} from "lucide-react";

export function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: "Guest User",
    email: "",
    phone: "",
    joinDate: "",
  });

  // State for update modal
  const [updateBookingId, setUpdateBookingId] = useState(null);
  const [updateDate, setUpdateDate] = useState("");
  const [updateSeats, setUpdateSeats] = useState([]);

  const getUserData = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo && userInfo !== "undefined" && userInfo !== "null") {
        const parsed = JSON.parse(userInfo);
        return {
          id: parsed._id || parsed.id,
          name:
            parsed.firstName && parsed.lastName
              ? `${parsed.firstName} ${parsed.lastName}`
              : parsed.name || parsed.email || "Guest User",
          email: parsed.email || "",
          phone: parsed.phoneNumber || parsed.phone || "",
          joinDate: parsed.createdAt
            ? new Date(parsed.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "",
        };
      }
      return null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  };

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    } else {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = userData?.id;
        if (!userId) {
          setError("User ID not found. Please log in again.");
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `http://localhost:8000/api/bookings/user/${userId}`
        );
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load bookings. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(
        err.response?.data?.message || "Failed to cancel booking. Please try again."
      );
    }
  };

  // Open Update Modal
  const openUpdateModal = (booking) => {
    setUpdateBookingId(booking._id);
    setUpdateDate(booking.date?.split("T")[0] || "");
    setUpdateSeats(booking.seats?.map((s) => s.name) || []);
  };

  // Update Booking
  const handleUpdateBooking = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/bookings/${updateBookingId}`,
        {
          date: updateDate,
          seats: updateSeats, // array of seat names
        }
      );

      setBookings((prev) =>
        prev.map((b) => (b._id === updateBookingId ? res.data.booking : b))
      );

      setUpdateBookingId(null);
      alert("Booking updated successfully.");
    } catch (err) {
      console.error("Error updating booking:", err);
      alert(err.response?.data?.message || "Failed to update booking.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Passenger Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 bg-blue-600 text-white">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold text-center">{user.name}</h2>
              <p className="text-blue-100 text-center text-sm">{user.email}</p>
              {user.joinDate && (
                <p className="text-blue-200 text-center text-xs mt-2">
                  Member since {user.joinDate}
                </p>
              )}
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`w-full flex items-center p-3 rounded-md ${
                      activeTab === "bookings"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <TicketIcon size={18} className="mr-3" />
                    <span>My Bookings</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center p-3 rounded-md ${
                      activeTab === "profile"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <UserIcon size={18} className="mr-3" />
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`w-full flex items-center p-3 rounded-md ${
                      activeTab === "notifications"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <BellIcon size={18} className="mr-3" />
                    <span>Notifications</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center p-3 rounded-md ${
                      activeTab === "settings"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <SettingsIcon size={18} className="mr-3" />
                    <span>Settings</span>
                  </button>
                </li>
                <li className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-md text-red-600 hover:bg-red-50"
                  >
                    <LogOutIcon size={18} className="mr-3" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === "bookings" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Bookings</h2>
                <Link
                  to="/book-seats"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Book New Trip
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-red-800">
                        Error Loading Bookings
                      </h3>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your bookings...</p>
                </div>
              ) : bookings.length === 0 && !error ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <TicketIcon
                    size={64}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Bookings Found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You haven't made any bookings yet. Start your journey today!
                  </p>
                  <Link
                    to="/book-seats"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Book a Ticket
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id || booking.bookingId}
                      className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">
                            Booking ID:
                          </span>
                          <span className="ml-2 font-medium">
                            {booking.bookingId || booking._id}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                              booking.paymentStatus === "Confirmed" ||
                              booking.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-800"
                                : booking.paymentStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.paymentStatus === "Confirmed" ||
                            booking.paymentStatus === "Paid" ? (
                              <CheckCircleIcon size={14} className="mr-1" />
                            ) : (
                              <XCircleIcon size={14} className="mr-1" />
                            )}
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div className="mb-4 md:mb-0">
                            <h3 className="font-semibold text-lg">
                              {booking.route?.from} → {booking.route?.to}
                            </h3>
                            <div className="flex items-center text-gray-600 mt-1">
                              <MapPinIcon size={16} className="mr-1" />
                              <span>
                                {booking.route?.distance} km •{" "}
                                {booking.route?.duration} hrs
                              </span>
                            </div>
                          </div>
                          <div className="mb-4 md:mb-0">
                            <div className="flex items-center">
                              <CalendarIcon
                                size={16}
                                className="mr-1 text-blue-600"
                              />
                              <span>
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                            </div>
                            {booking.route?.departureTime && (
                              <div className="flex items-center mt-1">
                                <ClockIcon
                                  size={16}
                                  className="mr-1 text-blue-600"
                                />
                                <span>{booking.route.departureTime}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Seats</div>
                            <div className="font-medium">
                              {booking.seats?.map((s) => s.name).join(", ") ||
                                "N/A"}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              LKR {booking.totalAmount?.toLocaleString() || "0"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                          <Link
                            to={`/e-ticket/${booking._id || booking.bookingId}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            View E-Ticket
                          </Link>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm"
                          >
                            Cancel Booking
                          </button>
                          <button
                            onClick={() => openUpdateModal(booking)}
                            className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors text-sm"
                          >
                            Update Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Update Modal */}
              {updateBookingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96">
                    <h2 className="text-lg font-semibold mb-4">Update Booking</h2>
                    <div className="mb-4">
                      <label className="text-sm text-gray-600">Travel Date</label>
                      <input
                        type="date"
                        value={updateDate}
                        onChange={(e) => setUpdateDate(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm text-gray-600">Seats (comma separated)</label>
                      <input
                        type="text"
                        value={updateSeats.join(",")}
                        onChange={(e) =>
                          setUpdateSeats(e.target.value.split(",").map(s => s.trim()))
                        }
                        className="w-full border rounded-md px-3 py-2 mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setUpdateBookingId(null)}
                        className="px-4 py-2 border rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateBooking}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
