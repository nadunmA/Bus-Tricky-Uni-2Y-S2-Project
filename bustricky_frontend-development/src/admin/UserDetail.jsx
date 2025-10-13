import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bus,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Crown,
  DollarSign,
  Edit,
  Globe,
  HeadphonesIcon,
  Mail,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Star,
  Ticket,
  Truck,
  User,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserService } from "../services/UserService";
import axios from "axios";

const UserDetail = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "passenger",
    isActive: true,
    dateOfBirth: "",
    gender: "",
    country: "Sri Lanka",
    address: {
      city: "",
      state: "",
      zipCode: "",
      country: "Sri Lanka",
    },

    licenseNumber: "",
    licenseExpiry: "",
    vehicleNumber: "",
    yearsOfExperience: "",
    emergencyContact: "",
    currentRoute: "",
    employmentStatus: "",
    shiftPreference: "",
    salary: "",
    specialQualifications: "",
    medicalCertificateExpiry: "",
    bloodType: "",
    medicalConditions: "",
    weeklySchedule: {},
    preferredRoutes: [],
    maximumWorkingHours: 8,
    availableForOvertime: false,

    createdAt: "",
    updatedAt: "",
    lastLogin: "",
    isVerified: false,
    profilePicture: "",
    totalBookings: 0,
    totalSpent: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Booking-related state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  // Mock data
  const [driverMetrics] = useState({
    totalTrips: 1247,
    totalKilometers: 45890,
    averageRating: 4.7,
    onTimePercentage: 94,
    totalPassengers: 18567,
    fuelEfficiency: 8.5,
    safeDrivingScore: 96,
    monthlyEarnings: 85000,
    completedTripsThisMonth: 47,
    avgTripDuration: "2.5 hours",
    customerSatisfaction: 4.8,
  });

  const [recentTrips] = useState([
    {
      id: 1,
      route: "Colombo - Kandy",
      date: "2024-12-30",
      startTime: "06:30 AM",
      endTime: "09:45 AM",
      passengers: 42,
      distance: 115,
      rating: 4.8,
      status: "Completed",
      earnings: 2850,
    },
    {
      id: 2,
      route: "Kandy - Colombo",
      date: "2024-12-30",
      startTime: "10:15 AM",
      endTime: "01:30 PM",
      passengers: 38,
      distance: 115,
      rating: 4.6,
      status: "Completed",
      earnings: 2650,
    },
    {
      id: 3,
      route: "Colombo - Galle",
      date: "2024-12-29",
      startTime: "07:00 AM",
      endTime: "09:30 AM",
      passengers: 35,
      distance: 119,
      rating: 4.9,
      status: "Completed",
      earnings: 2980,
    },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("No user ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await UserService.getUserById(userId);

        if (response.success && response.data) {
          let userData = response.data.data || response.data;

          const initialFormData = {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            role: userData.role || "passenger",
            isActive: userData.isActive !== false,
            dateOfBirth: userData.dateOfBirth || null,
            gender: userData.gender || "",
            country:
              userData.country || userData.address?.country || "Sri Lanka",
            address: {
              city: userData.address?.city || userData.city || "",
              state: userData.address?.state || userData.state || "",
              zipCode: userData.address?.zipCode || userData.zipCode || "",
              country:
                userData.address?.country || userData.country || "Sri Lanka",
            },

            licenseNumber: userData.licenseNumber || "",
            licenseExpiry: userData.licenseExpiry || null,
            vehicleNumber: userData.vehicleNumber || "",
            yearsOfExperience: userData.yearsOfExperience || "",
            emergencyContact: userData.emergencyContact || "",
            currentRoute: userData.currentRoute || "",
            employmentStatus: userData.employmentStatus || "",
            shiftPreference: userData.shiftPreference || "",
            salary: userData.salary || "",
            specialQualifications: userData.specialQualifications || "",
            medicalCertificateExpiry: userData.medicalCertificateExpiry || null,
            bloodType: userData.bloodType || "",
            medicalConditions: userData.medicalConditions || "",
            weeklySchedule: userData.weeklySchedule || {},
            preferredRoutes: userData.preferredRoutes || [],
            maximumWorkingHours: userData.maximumWorkingHours || 8,
            availableForOvertime: userData.availableForOvertime || false,

            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLogin: userData.lastLogin,
            isVerified: userData.isVerified || false,
            profilePicture: userData.profilePicture,
            totalBookings: userData.totalBookings || 0,
            totalSpent: userData.totalSpent || 0,
          };

          setFormData(initialFormData);
        } else {
          setError(response.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Fetch user bookings
  const fetchUserBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);

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

  useEffect(() => {
    if (
      (activeTab === "bookings" || activeTab === "trips") &&
      formData.role !== "driver"
    ) {
      fetchUserBookings();
    }
  }, [activeTab, formData.role]);

  const getStatusColor = (status) => {
    if (status) return "text-green-700 bg-green-100";
    return "text-red-700 bg-red-100";
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-purple-700 bg-purple-100";
      case "driver":
        return "text-green-700 bg-green-100";
      case "support":
        return "text-blue-700 bg-blue-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-5 h-5 text-purple-600" />;
      case "support":
        return <HeadphonesIcon className="w-5 h-5 text-blue-600" />;
      case "driver":
        return <Car className="w-5 h-5 text-green-600" />;
      case "passenger":
        return <Users className="w-5 h-5 text-gray-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const getExpiryStatus = (days) => {
    if (days === null)
      return { color: "gray", text: "Unknown", icon: AlertCircle };
    if (days < 0) return { color: "red", text: "Expired", icon: AlertTriangle };
    if (days <= 30)
      return { color: "red", text: "Expires Soon", icon: AlertTriangle };
    if (days <= 90)
      return { color: "yellow", text: "Renewal Due", icon: AlertCircle };
    return { color: "green", text: "Valid", icon: CheckCircle };
  };

  const getWorkingDaysCount = (schedule) => {
    if (!schedule || typeof schedule !== "object") return 0;
    return Object.values(schedule).filter((day) => day && day.isWorking).length;
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

  const getBookingStatusColor = (status) => {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading user details...</p>
          <p className="text-sm text-gray-500 mt-2">User ID: {userId}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Unable to load user</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/admin/userlist")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to User List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const licenseExpiryDays = getDaysUntilExpiry(formData.licenseExpiry);
  const licenseExpiryStatus = getExpiryStatus(licenseExpiryDays);
  const workingDaysCount = getWorkingDaysCount(formData.weeklySchedule);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/userlist")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to User List</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-gray-600">
                Complete user information and account status
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/useredit/${userId}`)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            <span>Edit User</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt={`${formData.firstName} ${formData.lastName}`}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {`${formData.firstName} ${formData.lastName}`}
              </h2>
              <p className="text-gray-600">{formData.email}</p>

              <div className="flex justify-center space-x-2 mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getRoleColor(
                    formData.role
                  )}`}
                >
                  {getRoleIcon(formData.role)}
                  <span className="ml-1">
                    {formData.role.charAt(0).toUpperCase() +
                      formData.role.slice(1)}
                  </span>
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    formData.isActive
                  )}`}
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <div className="flex items-center space-x-2">
                  {formData.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      formData.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Verified</span>
                <div className="flex items-center space-x-2">
                  {formData.isVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span
                    className={`font-medium ${
                      formData.isVerified ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {formData.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>

              {formData.role === "driver" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Working Days</span>
                    <span className="font-medium text-gray-900">
                      {workingDaysCount}/7 days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">License Status</span>
                    <div className="flex items-center space-x-2">
                      <licenseExpiryStatus.icon
                        className={`w-4 h-4 text-${licenseExpiryStatus.color}-600`}
                      />
                      <span
                        className={`font-medium text-${licenseExpiryStatus.color}-600`}
                      >
                        {licenseExpiryStatus.text}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-medium text-gray-900">
                  {formData.totalBookings}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-medium text-gray-900">
                  ${formData.totalSpent || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-3 space-y-6">
          {/* Detailed Information */}
          <div className="lg:col-span-3 space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Overview", icon: User },
                    { id: "bookings", label: "Bookings", icon: Ticket },
                    { id: "trips", label: "Trip History", icon: Bus },
                    {
                      id: "professional",
                      label: "Professional Info",
                      icon: Car,
                      condition: formData.role === "driver",
                    },
                    {
                      id: "schedule",
                      label: "Schedule & Routes",
                      icon: Calendar,
                      condition: formData.role === "driver",
                    },
                    {
                      id: "performance",
                      label: "Performance",
                      icon: Star,
                      condition: formData.role === "driver",
                    },
                    { id: "activity", label: "Activity", icon: Clock },
                  ]
                    .filter((tab) => tab.condition !== false)
                    .map((tab) => {
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

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Email Address
                        </p>
                        <p className="text-gray-900">
                          {formData.email || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Phone Number
                        </p>
                        <p className="text-gray-900">
                          {formData.phoneNumber || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Location
                        </p>
                        <p className="text-gray-900">
                          {formData.address?.city || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Country
                        </p>
                        <p className="text-gray-900">
                          {formData.country || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Date of Birth
                        </p>
                        <p className="text-gray-900">
                          {formData.dateOfBirth
                            ? formatDateOnly(formData.dateOfBirth)
                            : "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Gender
                        </p>
                        <p className="text-gray-900">
                          {formData.gender || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Full Address
                    </h4>
                    <p className="text-gray-700">
                      {[
                        formData.address?.city,
                        formData.address?.state,
                        formData.address?.zipCode,
                        formData.address?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </p>
                  </div>
                </div>

                {formData.role === "driver" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Driver Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          License Number
                        </p>
                        <p className="text-gray-900 font-mono">
                          {formData.licenseNumber || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          License Expiry
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-900">
                            {formData.licenseExpiry
                              ? formatDateOnly(formData.licenseExpiry)
                              : "Not provided"}
                          </p>
                          {licenseExpiryDays !== null && (
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                licenseExpiryStatus.color === "red"
                                  ? "bg-red-100 text-red-800"
                                  : licenseExpiryStatus.color === "yellow"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {licenseExpiryDays > 0
                                ? `${licenseExpiryDays} days left`
                                : "Expired"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Vehicle Number
                        </p>
                        <p className="text-gray-900">
                          {formData.vehicleNumber || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Years of Experience
                        </p>
                        <p className="text-gray-900">
                          {formData.yearsOfExperience || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Emergency Contact
                        </p>
                        <p className="text-gray-900">
                          {formData.emergencyContact || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Current Route
                        </p>
                        <p className="text-gray-900">
                          {formData.currentRoute || "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      User Bookings
                    </h3>
                  </div>
                </div>

                {bookingsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bookings...</p>
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
                      No bookings
                    </h4>
                    <p className="text-gray-600 mb-6">
                      This user hasn't made any bookings yet.
                    </p>
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
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getBookingStatusColor(
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
                                    {new Date(
                                      booking.date
                                    ).toLocaleDateString()}
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
                                    {booking.totalAmount?.toLocaleString() ||
                                      "0"}
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
                      This user hasn't completed any trips yet.
                    </p>
                  </div>
                ) : formData.role === "driver" ? (
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
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Passengers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Earnings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentTrips.map((trip) => (
                          <tr key={trip.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {trip.route}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trip.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trip.startTime} - {trip.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trip.passengers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                {trip.rating}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              LKR {trip.earnings}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                          const statusColor = getBookingStatusColor(status);

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
                                LKR{" "}
                                {(booking.totalAmount || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
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

            {activeTab === "professional" && formData.role === "driver" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Employment Status
                      </p>
                      <p className="text-gray-900 capitalize">
                        {formData.employmentStatus?.replace("-", " ") ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Shift Preference
                      </p>
                      <p className="text-gray-900 capitalize">
                        {formData.shiftPreference || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Monthly Salary
                      </p>
                      <p className="text-gray-900">
                        {formData.salary
                          ? `LKR ${formData.salary.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Max Working Hours
                      </p>
                      <p className="text-gray-900">
                        {formData.maximumWorkingHours} hours/day
                      </p>
                    </div>
                  </div>

                  {formData.specialQualifications && (
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Special Qualifications
                      </p>
                      <p className="text-gray-700">
                        {formData.specialQualifications}
                      </p>
                    </div>
                  )}
                </div>

                {/* Health & Safety */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Health & Safety Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Medical Certificate Expiry
                      </p>
                      <p className="text-gray-900">
                        {formData.medicalCertificateExpiry
                          ? formatDateOnly(formData.medicalCertificateExpiry)
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Blood Type
                      </p>
                      <p className="text-gray-900">
                        {formData.bloodType || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {formData.medicalConditions && (
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Medical Conditions/Allergies
                      </p>
                      <p className="text-gray-700">
                        {formData.medicalConditions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schedule & Routes Tab */}
            {activeTab === "schedule" && formData.role === "driver" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Weekly Schedule
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(formData.weeklySchedule || {}).map(
                      ([day, schedule]) => (
                        <div
                          key={day}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 ${
                                schedule?.isWorking
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <span className="font-medium text-gray-900 capitalize">
                              {day}
                            </span>
                          </div>
                          {schedule?.isWorking ? (
                            <div className="text-sm text-gray-600">
                              {schedule.startTime} - {schedule.endTime}
                              {schedule.route && (
                                <span className="ml-2 text-blue-600">
                                  ({schedule.route})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Not working
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Preferred Routes */}
                {formData.preferredRoutes &&
                  formData.preferredRoutes.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Preferred Routes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.preferredRoutes.map((route, index) => (
                          <span
                            key={index}
                            className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {route}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Work Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Maximum Working Hours
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.maximumWorkingHours || 8} hours/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Available for Overtime
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          formData.availableForOvertime
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formData.availableForOvertime ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && formData.role === "driver" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {driverMetrics.totalTrips}
                      </div>
                      <div className="text-sm text-blue-700">Total Trips</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {driverMetrics.averageRating}
                      </div>
                      <div className="text-sm text-green-700">
                        Average Rating
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {driverMetrics.onTimePercentage}%
                      </div>
                      <div className="text-sm text-purple-700">
                        On-Time Rate
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Trips */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Recent Trips
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Route
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Passengers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Earnings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentTrips.map((trip) => (
                          <tr key={trip.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {trip.route}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trip.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trip.startTime} - {trip.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trip.passengers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                {trip.rating}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              LKR {trip.earnings}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Account Activity
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Account Created</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(formData.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(formData.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(formData.lastLogin)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
