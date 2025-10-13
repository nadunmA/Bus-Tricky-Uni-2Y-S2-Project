import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bus,
  Calendar,
  Camera,
  CheckCircle,
  CreditCard,
  Edit,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  Star,
  Trash2,
  Upload,
  User,
  X,
  Ticket,
  Clock,
  DollarSign,
  Navigation,
  XCircle,
  MessageCircle,
  Pencil,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserService } from "../services/UserService";
import axios from "axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Booking-related state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  // Support tickets state
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState(null);

    // Edit support ticket modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editInputs, setEditInputs] = useState({ Subject: "", Message: "" });
  const [isEditing, setIsEditing] = useState(false);

  // Delete support ticket confirm
  const [showTicketDeleteConfirm, setShowTicketDeleteConfirm] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState(null);


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [refundPolicy, setRefundPolicy] = useState(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPassengerDetails({ ...passengerDetails, [name]: value });
  };

  const openUpdateModal = (booking) => {
    setUpdatingBookingId(booking._id || booking.bookingId);
    setPassengerDetails({
      name: booking.passenger?.name || "",
      email: booking.passenger?.email || "",
      phone: booking.passenger?.phone || "",
    });
    setShowUpdateModal(true);
  };

  const handleUpdatePassenger = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `http://localhost:8000/api/bookings/${updatingBookingId}/passenger`,
        passengerDetails,
        {
          headers: {
            Authorization: `Bearer ${getAuthData().token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Passenger details updated successfully");
        setShowUpdateModal(false);
        setUpdatingBookingId(null);
        fetchUserBookings(); // Refresh bookings list
      } else {
        setError(response.data.message || "Failed to update passenger details");
      }
    } catch (err) {
      console.error("Error updating passenger:", err);
      setError(
        err.response?.data?.message || "Failed to update passenger details"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    try {
      const keysToRemove = [
        "userInfo",
        "token",
        "authToken",
        "userId",
        "user_id",
        "user",
        "refreshToken",
        "sessionData",
        "currentUser",
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log("User logged out successfully");
      navigate("/user/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/user/login", { replace: true });
    }
  };

  const getAuthData = () => {
    const possibleTokenKeys = ["token", "authToken", "accessToken", "jwt"];
    const possibleUserKeys = ["userId", "user_id", "id", "_id"];
    const possibleUserInfoKeys = [
      "userInfo",
      "user",
      "currentUser",
      "userData",
    ];

    let token = null;
    let userId = null;
    let userInfo = null;

    for (const key of possibleTokenKeys) {
      const value = localStorage.getItem(key);
      if (value && value !== "undefined" && value !== "null") {
        token = value;
        break;
      }
    }

    for (const key of possibleUserKeys) {
      const value = localStorage.getItem(key);
      if (value && value !== "undefined" && value !== "null") {
        userId = value;
        break;
      }
    }

    for (const key of possibleUserInfoKeys) {
      const value = localStorage.getItem(key);
      if (value && value !== "undefined" && value !== "null") {
        try {
          userInfo = JSON.parse(value);
          if (!userId && userInfo) {
            userId = userInfo._id || userInfo.id;
          }
          break;
        } catch (err) {
          console.warn(`Failed to parse ${key}:`, err);
        }
      }
    }

    return { token, userId, userInfo };
  };

  // Fetch user bookings
  const fetchUserBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);

      const { userId } = getAuthData();
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(
        `http://localhost:8000/api/bookings/user/${userId}`
      );

      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookingsError(
        error.response?.data?.message || "Failed to fetch bookings"
      );
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch support tickets
  const fetchSupportTickets = async () => {
    try {
      setSupportLoading(true);
      setSupportError(null);

      const { userId } = getAuthData();
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(
        `http://localhost:8000/api/contact/user/${userId}`
      );

      if (response.data && response.data.data) {
        setSupportTickets(response.data.data);
      } else {
        setSupportTickets([]);
      }
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      setSupportError(
        error.response?.data?.message || "Failed to fetch support tickets"
      );
      setSupportTickets([]);
    } finally {
      setSupportLoading(false);
    }
  };

  const transformUserData = (apiUserData) => {
    let cityDisplay = "Not provided";
    let provinceDisplay = "Not provided";
    let postalCodeDisplay = "Not provided";
    let countryDisplay = "Sri Lanka";
    let addressDisplay = "Not provided";

    if (apiUserData.address && typeof apiUserData.address === "object") {
      cityDisplay = apiUserData.address.city || cityDisplay;
      provinceDisplay =
        apiUserData.address.state ||
        apiUserData.address.province ||
        provinceDisplay;
      postalCodeDisplay =
        apiUserData.address.zipCode ||
        apiUserData.address.postalCode ||
        postalCodeDisplay;
      countryDisplay = apiUserData.address.country || countryDisplay;
      addressDisplay =
        apiUserData.address.street ||
        apiUserData.address.address ||
        addressDisplay;
    } else if (
      typeof apiUserData.address === "string" &&
      apiUserData.address.trim()
    ) {
      addressDisplay = apiUserData.address;
    }

    if (apiUserData.city) cityDisplay = apiUserData.city;
    if (apiUserData.province || apiUserData.state)
      provinceDisplay = apiUserData.province || apiUserData.state;
    if (apiUserData.postalCode || apiUserData.zipCode)
      postalCodeDisplay = apiUserData.postalCode || apiUserData.zipCode;
    if (apiUserData.country) countryDisplay = apiUserData.country;

    return {
      id: apiUserData._id?.$oid || apiUserData._id || apiUserData.id || "N/A",
      name:
        apiUserData.firstName && apiUserData.lastName
          ? `${apiUserData.firstName} ${apiUserData.lastName}`
          : apiUserData.name || apiUserData.email || "Unknown User",
      email: apiUserData.email || "No email provided",
      phone: apiUserData.phoneNumber || apiUserData.phone || "Not provided",
      location: cityDisplay,
      fullAddress: apiUserData.address,
      joinDate: apiUserData.createdAt?.$date?.$numberLong
        ? new Date(apiUserData.createdAt.$date.$numberLong).toISOString()
        : apiUserData.createdAt || new Date().toISOString(),
      lastLogin: apiUserData.lastLogin?.$date?.$numberLong
        ? new Date(apiUserData.lastLogin.$date.$numberLong).toISOString()
        : apiUserData.lastLogin || new Date().toISOString(),
      status: apiUserData.isActive !== false ? "Active" : "Inactive",
      userType: apiUserData.role || apiUserData.userType || "passenger",
      avatar: apiUserData.profilePicture || apiUserData.avatar || null,
      totalTrips:
        apiUserData.totalBookings?.$numberInt || apiUserData.totalTrips || 0,
      totalSpent:
        apiUserData.totalSpent?.$numberInt || apiUserData.totalSpent || 0,
      favoriteRoutes: apiUserData.favoriteRoutes || [],
      rating: apiUserData.rating || 0,
      verified: apiUserData.isVerified || false,
      firstName: apiUserData.firstName || "",
      lastName: apiUserData.lastName || "",
      dateOfBirth: apiUserData.dateOfBirth || "",
      gender: apiUserData.gender || "",
      country: countryDisplay,
      province: provinceDisplay,
      postalCode: postalCodeDisplay,
      address: addressDisplay,
      city: cityDisplay,
    };
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { token, userInfo } = getAuthData();

        if (
          userInfo &&
          typeof userInfo === "object" &&
          userInfo.phoneNumber &&
          userInfo.address
        ) {
          const processedUserData = transformUserData(userInfo);
          setUserData(processedUserData);
          setLoading(false);
          return;
        }

        if (token) {
          try {
            const response = await UserService.getProfile();
            if (response.success && response.data) {
              let apiUserData = response.data;
              if (apiUserData.success && apiUserData.data) {
                apiUserData = apiUserData.data;
              } else if (
                apiUserData.data &&
                typeof apiUserData.data === "object"
              ) {
                apiUserData = apiUserData.data;
              }

              const processedUserData = transformUserData(apiUserData);
              setUserData(processedUserData);
              localStorage.setItem(
                "userInfo",
                JSON.stringify(processedUserData)
              );
              localStorage.setItem("userId", processedUserData.id);
              setLoading(false);
              return;
            }
          } catch (profileError) {
            console.warn("Profile fetch failed:", profileError);
          }
        }

        throw new Error("No authentication data found. Please log in again.");
      } catch (error) {
        console.error("Error loading user data:", error);
        setError(error.message || "Failed to load profile");
        if (
          error.message.includes("authentication") ||
          error.message.includes("token") ||
          error.message.includes("login")
        ) {
          setTimeout(() => {
            localStorage.clear();
            navigate("/user/login", { replace: true });
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch bookings when component mounts or when bookings tab is active
  useEffect(() => {
    if (activeTab === "bookings" && userData) {
      fetchUserBookings();
    }
  }, [activeTab, userData]);

  // Fetch support tickets when support tab is active
  useEffect(() => {
    if (activeTab === "support" && userData) {
      fetchSupportTickets();
    }
  }, [activeTab, userData]);


  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setError("Password is required for account deletion");
      return;
    }

    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await UserService.deleteAccount(
        deletePassword,
        deleteReason
      );

      if (response.success) {
        localStorage.clear();
        sessionStorage.clear();
        setSuccessMessage("Account deleted successfully");
        setTimeout(() => {
          navigate("/user/login", {
            replace: true,
            state: { message: "Your account has been deleted successfully" },
          });
        }, 2000);
      } else {
        setError(response.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setError("An error occurred while deleting your account");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDeleteModal = () => {
    setDeletePassword("");
    setDeleteReason("");
    setConfirmText("");
    setDeleteStep(1);
    setShowDeleteModal(false);
  };

  const getImageUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http")) return profilePicture;
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const path = profilePicture.startsWith("/")
      ? profilePicture
      : `/${profilePicture}`;
    return `${backendUrl}${path}`;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setShowUploadModal(true);
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await UserService.uploadProfilePicture(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        setSuccessMessage("Profile picture updated successfully");
        setShowUploadModal(false);
        setPreview(null);
        setSelectedFile(null);
        setTimeout(() => window.location.reload(), 500);
      } else {
        setError(result.message || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload profile picture");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!userData?.avatar) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile picture?"
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const result = await UserService.deleteProfilePicture();

      if (result.success) {
        setSuccessMessage("Profile picture deleted successfully");
        window.location.reload();
      } else {
        setError(result.message || "Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete profile picture");
    } finally {
      setDeleting(false);
    }
  };

  const getBookingStatus = (booking) => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    const isPast = bookingDate < today;

    if (booking.paymentStatus === "Cancelled") return "Cancelled";
    if (booking.paymentStatus === "Failed") return "Payment Failed";
    if (booking.paymentStatus === "Pending") return "Payment Pending";
    if (isPast) return "Completed";
    return "Confirmed";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Payment Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
      case "Payment Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTicketStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const handleCancelBooking = async (bookingId) => {
    try {
      setIsCancelling(true);

      const response = await axios.delete(
        `http://localhost:8000/api/bookings/delete/${bookingId}`,
        {
          reason: cancellationReason,
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthData().token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Booking cancelled successfully");
        setShowCancelModal(false);
        setCancellingBookingId(null);
        setCancellationReason("");
        // Refresh bookings list
        fetchUserBookings();
      } else {
        setError(response.data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setError(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const calculateRefund = (booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilTrip = (bookingDate - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let policyMessage = "";

    if (hoursUntilTrip > 48) {
      refundPercentage = 90;
      policyMessage = "90% refund (more than 48 hours before departure)";
    } else if (hoursUntilTrip > 24) {
      refundPercentage = 50;
      policyMessage = "50% refund (24-48 hours before departure)";
    } else if (hoursUntilTrip > 6) {
      refundPercentage = 25;
      policyMessage = "25% refund (6-24 hours before departure)";
    } else {
      refundPercentage = 0;
      policyMessage = "No refund (less than 6 hours before departure)";
    }

    const refundAmount = (booking.totalAmount * refundPercentage) / 100;

    return {
      percentage: refundPercentage,
      amount: refundAmount,
      message: policyMessage,
    };
  };

  const openCancelModal = (booking) => {
    const refundInfo = calculateRefund(booking);
    setRefundPolicy(refundInfo);
    setCancellingBookingId(booking._id || booking.bookingId);
    setShowCancelModal(true);
  };

  const canCancelBooking = (booking) => {
    const status = getBookingStatus(booking);
    const bookingDate = new Date(booking.date);
    const now = new Date();

    // Can only cancel if: not already cancelled, not completed, and trip is in future
    return (
      status !== "Cancelled" &&
      status !== "Payment Failed" &&
      status !== "Completed" &&
      bookingDate > now
    );
  };


  const openEditModal = (ticket) => {
    setEditInputs({ Subject: ticket.Subject, Message: ticket.Message });
    setEditingTicketId(ticket._id);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async () => {
    try {
      setIsEditing(true);
      const response = await axios.put(
        
        `http://localhost:8000/api/contact/id/${editingTicketId}`,
        editInputs
      );
      if (response.data.success) {
        setSuccessMessage("Ticket updated successfully");
        setShowEditModal(false);
        fetchSupportTickets();
      } else {
        setError(response.data.message || "Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      setError(error.response?.data?.message || "Failed to update ticket");
    } finally {
      setIsEditing(false);
    }
  };

  const openTicketDeleteConfirm = (ticketId) => {
    setDeletingTicketId(ticketId);
    setShowTicketDeleteConfirm(true);
  };

  const handleDeleteTicket = async () => {
    try {
      const response = await axios.delete(
       
        `http://localhost:8000/api/contact/id/${deletingTicketId}`,
      );
      if (response.data.success) {
        setSuccessMessage("Ticket deleted successfully");
        setShowTicketDeleteConfirm(false);
        fetchSupportTickets();
      } else {
        setError(response.data.message || "Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      setError(error.response?.data?.message || "Failed to delete ticket");
    }
  };



  const cancellationReasons = [
    "Change of travel plans",
    "Found alternative transport",
    "Personal emergency",
    "Schedule conflict",
    "Weather concerns",
    "Health issues",
    "Other",
  ];

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Mock data
  const recentTrips = [
    {
      id: 1,
      route: "Colombo - Kandy",
      date: "2024-12-30",
      amount: 450,
      status: "Completed",
    },
    {
      id: 2,
      route: "Negombo - Colombo",
      date: "2024-12-29",
      amount: 180,
      status: "Completed",
    },
    {
      id: 3,
      route: "Colombo - Galle",
      date: "2024-12-28",
      amount: 320,
      status: "Completed",
    },
    {
      id: 4,
      route: "Kandy - Colombo",
      date: "2024-12-27",
      amount: 450,
      status: "Cancelled",
    },
  ];

  const reasonOptions = [
    "No longer need the service",
    "Privacy concerns",
    "Found a better alternative",
    "Too many emails/notifications",
    "Account security concerns",
    "Service not meeting expectations",
    "Other",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profile Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/user/login", { replace: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {userData.avatar ? (
                      <img
                        src={getImageUrl(userData.avatar)}
                        alt={userData.name}
                        className="w-20 h-20 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-20 h-20 flex items-center justify-center"
                      style={{ display: userData.avatar ? "none" : "flex" }}
                    >
                      <User className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || deleting}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData.name}
                  </h1>
                  <p className="text-gray-600">{userData.email}</p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userData.status}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full ml-2">
                      {userData.userType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/user/usereditprofile")}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "bookings", label: "My Bookings", icon: Ticket },
                { id: "trips", label: "Trip History", icon: Bus },
                {
                  id: "support",
                  label: "Support Tickets",
                  icon: MessageCircle,
                },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">First Name</p>
                      <p className="font-medium text-gray-900">
                        {userData.firstName || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Last Name</p>
                      <p className="font-medium text-gray-900">
                        {userData.lastName || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-medium text-gray-900">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {userData.phone}
                      </p>
                    </div>
                  </div>
                  {userData.dateOfBirth && (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-medium text-gray-900">
                          {new Date(userData.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium text-gray-900">
                        {new Date(userData.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Address Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium text-gray-900">
                        {userData.city || userData.location || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Province/State</p>
                      <p className="font-medium text-gray-900">
                        {userData.province || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Postal Code</p>
                      <p className="font-medium text-gray-900">
                        {userData.postalCode || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-medium text-gray-900">
                        {userData.country || "Sri Lanka"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Usage Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Bus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {bookings.length || userData.totalTrips}
                    </p>
                    <p className="text-sm text-gray-600">Total Trips</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      LKR{" "}
                      {bookings
                        .reduce(
                          (total, booking) =>
                            total + (booking.totalAmount || 0),
                          0
                        )
                        .toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {userData.rating || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {userData.favoriteRoutes.length}
                    </p>
                    <p className="text-sm text-gray-600">Fav Routes</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    My Bookings
                  </h3>
                  <button
                    onClick={() => navigate("/book-seats")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    Book New Trip
                  </button>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your bookings...</p>
                </div>
              ) : bookingsError ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{bookingsError}</p>
                  <button
                    onClick={fetchUserBookings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Bus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No bookings yet
                  </h4>
                  <p className="text-gray-600 mb-6">
                    You haven't made any bus bookings yet. Start your journey
                    today!
                  </p>
                  <button
                    onClick={() => navigate("/book-seats")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Book Your First Trip
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id || booking.bookingId}
                      className="p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Bus className="w-5 h-5 mr-2 text-blue-600" />
                              {booking.route?.from || "Unknown"} →{" "}
                              {booking.route?.to || "Unknown"}
                            </h4>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                getBookingStatus(booking)
                              )}`}
                            >
                              {getBookingStatus(booking)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <div>
                                <p className="font-medium">Travel Date</p>
                                <p>
                                  {new Date(booking.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <Ticket className="w-4 h-4 mr-2" />
                              <div>
                                <p className="font-medium">Seats</p>
                                <p>
                                  {booking.seats
                                    ?.map((seat) => seat.name)
                                    .join(", ") || "Not specified"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <div>
                                <p className="font-medium">Amount</p>
                                <p>
                                  LKR{" "}
                                  {booking.totalAmount?.toLocaleString() || "0"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <div>
                                <p className="font-medium">Booked On</p>
                                <p>
                                  {new Date(
                                    booking.bookingDate || booking.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {booking.passenger && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                Passenger Details
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Name:</span>{" "}
                                  {booking.passenger.name || "Not provided"}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span>{" "}
                                  {booking.passenger.email || "Not provided"}
                                </div>
                                <div>
                                  <span className="font-medium">Phone:</span>{" "}
                                  {booking.passenger.phone || "Not provided"}
                                </div>
                              </div>
                            </div>
                          )}

                          {booking.bookingId && (
                            <div className="mt-3 text-xs text-gray-500">
                              Booking ID: {booking.bookingId}
                            </div>
                          )}
                        </div>
                      </div>
                      {canCancelBooking(booking) && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Booking
                          </button>
                        </div>
                      )}
                      {canCancelBooking(booking) && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => openUpdateModal(booking)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Update Booking
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "trips" && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Trip History
                </h3>
              </div>

              {bookingsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading trip history...</p>
                </div>
              ) : bookingsError ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{bookingsError}</p>
                  <button
                    onClick={fetchUserBookings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Bus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No trip history
                  </h4>
                  <p className="text-gray-600 mb-6">
                    You haven't completed any trips yet. Book your first
                    journey!
                  </p>
                  <button
                    onClick={() => navigate("/book-seats")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Book Your First Trip
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => {
                        const status = getBookingStatus(booking);
                        const statusColor = getStatusColor(status);

                        return (
                          <tr
                            key={booking._id || booking.bookingId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <Bus className="w-4 h-4 mr-2 text-blue-600" />
                                {booking.route?.from || "N/A"} →{" "}
                                {booking.route?.to || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(booking.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.seats
                                ?.map((seat) => seat.name)
                                .join(", ") || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              LKR {(booking.totalAmount || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-3">
                                {(status === "Confirmed" ||
                                  status === "Payment Pending") &&
                                  canCancelBooking(booking) && (
                                    <button
                                      onClick={() => openCancelModal(booking)}
                                      className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                {(status === "Confirmed" ||
                                  status === "Completed") && (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/e-ticket/${
                                          booking._id || booking.bookingId
                                        }`
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    View Ticket
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "support" && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Support Tickets
                  </h3>
                  <button
                    onClick={() => navigate("/support")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Create New Ticket
                  </button>
                </div>
              </div>

              {supportLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your tickets...</p>
                </div>
              ) : supportError ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{supportError}</p>
                  <button
                    onClick={fetchSupportTickets}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : supportTickets.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No support tickets yet
                  </h4>
                  <p className="text-gray-600 mb-6">
                    You haven't submitted any support tickets yet.
                  </p>
                  <button
                    onClick={() => navigate("/support")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Create Ticket
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {supportTickets.map((ticket) => (
                    <div key={ticket._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {ticket.Subject}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getTicketStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{ticket.Message}</p>
                      {ticket.adminResponse && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">
                            Admin Response
                          </h5>
                          <p className="text-gray-600">
                            {ticket.adminResponse}
                          </p>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mb-4">
                        Created: {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openEditModal(ticket)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => openTicketDeleteConfirm(ticket._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}











          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive trip updates via email
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Picture
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-3">
                    Upload a photo to personalize your profile
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || deleting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center text-sm"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New
                        </>
                      )}
                    </button>

                    {userData?.avatar && (
                      <button
                        onClick={handleDeleteProfilePicture}
                        disabled={uploading || deleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center text-sm"
                      >
                        {deleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-red-700 text-sm mb-4">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <div className="bg-red-100 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-red-800 mb-2">
                          What will be deleted:
                        </h4>
                        <ul className="text-red-700 text-sm space-y-1">
                          <li>• Your profile and personal information</li>
                          <li>• Trip history and travel data</li>
                          <li>• All preferences and settings</li>
                          <li>• Account access and login credentials</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <LogOut className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to log out? You'll need to log in again
                  to access your account.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Profile Picture
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setPreview(null);
                    setSelectedFile(null);
                    setUploadProgress(0);
                  }}
                  disabled={uploading}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {preview && (
                <div className="mb-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {uploading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-600">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-gray-600">Type: {selectedFile.type}</p>
                  </div>
                </div>
              )}

              <div className="mb-6 text-xs text-gray-500">
                <p className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Maximum file size: 5MB
                </p>
                <p className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadProfilePicture}
                  disabled={uploading || !selectedFile}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {deleteStep === 1 && (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          Delete Account
                        </h3>
                      </div>
                      <button
                        onClick={resetDeleteModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800 font-medium mb-2">
                        ⚠️ This action is irreversible
                      </p>
                      <p className="text-red-700 text-sm">
                        Your account and all associated data will be permanently
                        deleted. You will lose access to:
                      </p>
                      <ul className="mt-3 text-red-700 text-sm space-y-1">
                        <li>• Profile and personal information</li>
                        <li>• Trip history and travel data</li>
                        <li>• All preferences and settings</li>
                        <li>• Account access and login credentials</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for deletion (optional)
                      </label>
                      <select
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select a reason...</option>
                        {reasonOptions.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={resetDeleteModal}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setDeleteStep(2)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </>
              )}

              {deleteStep === 2 && (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lock className="w-6 h-6 text-red-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          Confirm Password
                        </h3>
                      </div>
                      <button
                        onClick={resetDeleteModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-6">
                      Please enter your current password to confirm account
                      deletion.
                    </p>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter your password"
                        autoFocus
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setDeleteStep(1)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setDeleteStep(3)}
                        disabled={!deletePassword.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </>
              )}

              {deleteStep === 3 && (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Trash2 className="w-6 h-6 text-red-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          Final Confirmation
                        </h3>
                      </div>
                      <button
                        onClick={resetDeleteModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                      <p className="text-red-800 font-medium mb-2">
                        Last chance to reconsider
                      </p>
                      <p className="text-red-700 text-sm">
                        This is your final warning. Once deleted, your account
                        cannot be recovered.
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type "DELETE" to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Type DELETE to confirm"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setDeleteStep(2)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        disabled={isDeleting}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={
                          confirmText !== "DELETE" ||
                          !deletePassword.trim() ||
                          isDeleting
                        }
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Cancel Booking
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellingBookingId(null);
                      setCancellationReason("");
                      setRefundPolicy(null);
                    }}
                    disabled={isCancelling}
                    className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Cancellation Policy
                  </h4>
                  {refundPolicy && (
                    <div className="text-sm text-yellow-700">
                      <p className="mb-2">{refundPolicy.message}</p>
                      {refundPolicy.percentage > 0 ? (
                        <p className="font-semibold">
                          Refund Amount: LKR{" "}
                          {refundPolicy.amount.toLocaleString()}
                        </p>
                      ) : (
                        <p className="font-semibold text-red-700">
                          No refund available for this cancellation
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation
                  </label>
                  <select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    disabled={isCancelling}
                  >
                    <option value="">Select a reason...</option>
                    {cancellationReasons.map((reason, index) => (
                      <option key={index} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-700">
                    <strong>Important:</strong> Cancellation is irreversible.
                    You'll need to make a new booking if you change your mind.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellingBookingId(null);
                      setCancellationReason("");
                      setRefundPolicy(null);
                    }}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={() => handleCancelBooking(cancellingBookingId)}
                    disabled={!cancellationReason || isCancelling}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Confirm Cancellation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}







        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Edit className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Update Passenger Details
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  name="name"
                  value={passengerDetails.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full p-2 border rounded-md"
                />
                <input
                  type="email"
                  name="email"
                  value={passengerDetails.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full p-2 border rounded-md"
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

              {/* Footer */}
              <div className="p-6 flex space-x-3">
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassenger}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}


                {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Pencil className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Edit Support Ticket
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={isEditing}
                    className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="Subject"
                    value={editInputs.Subject}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isEditing}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="Message"
                    value={editInputs.Message}
                    onChange={handleEditChange}
                    rows="5"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isEditing}
                  ></textarea>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isEditing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Ticket"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTicketDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Delete
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this support ticket? This
                  action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowTicketDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTicket}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
