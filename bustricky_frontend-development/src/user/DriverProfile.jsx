import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bus,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Route,
  Settings,
  Shield,
  Star,
  User,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountDeletion from "../components/AccountDeletion";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import { UserService } from "../services/UserService";

const DriverProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [driverStats] = useState({
    totalTrips: 1247,
    totalKilometers: 45890,
    averageRating: 4.7,
    onTimePercentage: 94,
    totalPassengers: 18567,
    fuelEfficiency: 8.5,
    safeDrivingScore: 96,
    monthlyEarnings: 85000,
    currentRoute: "Route 245",
    nextShift: "2024-01-02 06:00 AM",
    licenseExpiryDays: 180,
    vehicleMaintenanceDue: "2024-01-15",
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

  const [upcomingShifts] = useState([
    {
      id: 1,
      date: "2025-01-02",
      route: "Colombo - Kandy",
      startTime: "06:00 AM",
      endTime: "02:00 PM",
      busNumber: "WP CAB-1234",
      status: "Scheduled",
      estimatedPassengers: 40,
    },
    {
      id: 2,
      date: "2025-01-03",
      route: "Kandy - Colombo",
      startTime: "06:30 AM",
      endTime: "02:30 PM",
      busNumber: "WP CAB-1234",
      status: "Scheduled",
      estimatedPassengers: 38,
    },
    {
      id: 3,
      date: "2025-01-04",
      route: "Colombo - Galle",
      startTime: "07:00 AM",
      endTime: "03:00 PM",
      busNumber: "WP CAB-1234",
      status: "Scheduled",
      estimatedPassengers: 42,
    },
  ]);

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);

    fetchDriverProfile();
  };

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await UserService.getProfile();

      if (response.success && response.data) {
        let apiUserData = response.data;

        if (apiUserData.success && apiUserData.data) {
          apiUserData = apiUserData.data;
        } else if (apiUserData.data && typeof apiUserData.data === "object") {
          apiUserData = apiUserData.data;
        }

        const transformedData = {
          id: apiUserData._id || apiUserData.id || "N/A",
          name: `${apiUserData.firstName} ${apiUserData.lastName}`,
          email: apiUserData.email || "No email provided",
          phone: apiUserData.phoneNumber || "Not provided",
          role: apiUserData.role || "driver",

          licenseNumber: apiUserData.licenseNumber || "Not provided",
          licenseExpiry: apiUserData.licenseExpiry || null,
          vehicleNumber: apiUserData.vehicleNumber || "Not assigned",
          yearsOfExperience: apiUserData.yearsOfExperience || "Not specified",
          emergencyContact: apiUserData.emergencyContact || "Not provided",

          dateOfBirth: apiUserData.dateOfBirth || null,
          gender: apiUserData.gender || "Not specified",

          joinDate: apiUserData.createdAt || new Date().toISOString(),
          lastLogin: apiUserData.lastLogin || new Date().toISOString(),
          status: apiUserData.isActive !== false ? "Active" : "Inactive",
          verified: apiUserData.isVerified || false,

          profilePicture: apiUserData.profilePicture || null,
          avatar: apiUserData.profilePicture || apiUserData.avatar || null,

          location:
            apiUserData.address?.city || apiUserData.city || "Not specified",
          fullAddress: apiUserData.address || {
            city: apiUserData.city || "",
            state: apiUserData.state || "",
            zipCode: apiUserData.zipCode || "",
            country: apiUserData.country || "Sri Lanka",
          },
          country:
            apiUserData.country || apiUserData.address?.country || "Sri Lanka",

          totalTrips: apiUserData.totalBookings || 0,
          totalSpent: apiUserData.totalSpent || 0,
          preferences: apiUserData.preferences || {},
          currentRoute: apiUserData.currentRoute || "Not assigned",
          employmentStatus: apiUserData.employmentStatus || "Not specified",
          shiftPreference: apiUserData.shiftPreference || "Not specified",
          weeklySchedule: apiUserData.weeklySchedule || {},
          preferredRoutes: apiUserData.preferredRoutes || [],
          maximumWorkingHours: apiUserData.maximumWorkingHours || 8,
          availableForOvertime: apiUserData.availableForOvertime ?? false,
        };

        setUserData(transformedData);

        localStorage.setItem("userInfo", JSON.stringify(transformedData));
      } else {
        throw new Error("Failed to fetch driver profile");
      }
    } catch (err) {
      console.error("Error fetching driver profile:", err);
      setError(err.message || "Failed to load driver profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverProfile();
  }, []);

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
      navigate("/user/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/user/login", { replace: true });
    }
  };

  const getImageUrl = (profilePicture) => {
    if (!profilePicture) return null;

    if (profilePicture.startsWith("http")) {
      return profilePicture;
    }

    const backendUrl =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_BASE_URL ||
      "http://localhost:8000";

    const cleanPath = profilePicture.replace(/^\/+/, "");
    const fullUrl = `${backendUrl}/${cleanPath}`;

    return fullUrl;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
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
    return { color: "green", text: "Valid", icon: UserCheck };
  };

  const calculateProfileCompleteness = (data) => {
    if (!data) return 0;

    const requiredFields = [
      "name",
      "email",
      "phone",
      "licenseNumber",
      "licenseExpiry",
      "vehicleNumber",
      "yearsOfExperience",
      "emergencyContact",
    ];

    const completedFields = requiredFields.filter((field) => {
      const value = data[field];
      return (
        value &&
        value !== "Not provided" &&
        value !== "Not specified" &&
        value !== "Not assigned"
      );
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading driver profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Driver Profile Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Failed to load driver profile"}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2"
            >
              Retry Loading
            </button>
            <button
              onClick={() => navigate("/user/login", { replace: true })}
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const licenseExpiryDays = getDaysUntilExpiry(userData.licenseExpiry);
  const expiryStatus = getExpiryStatus(licenseExpiryDays);
  const profileCompleteness = calculateProfileCompleteness(userData);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Success</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <LogOut className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to log out?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                    {userData.profilePicture ? (
                      <>
                        <img
                          src={getImageUrl(userData.profilePicture)}
                          alt={userData.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />

                        <div
                          className="w-20 h-20 flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <Car className="w-10 h-10 text-white" />
                        </div>
                      </>
                    ) : (
                      <Car className="w-10 h-10 text-white" />
                    )}
                  </div>
                  {profileCompleteness === 100 && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData.name}
                  </h1>
                  <p className="text-gray-600">{userData.email}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                      Bus Driver
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userData.status}
                    </span>
                    {userData.verified && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <span>Profile: {profileCompleteness}% complete</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            profileCompleteness === 100
                              ? "bg-green-500"
                              : profileCompleteness >= 80
                              ? "bg-blue-500"
                              : profileCompleteness >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${profileCompleteness}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/driver/driveredit")}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {profileCompleteness < 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Complete your profile ({profileCompleteness}%)
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Complete your profile to unlock all features and improve your
                  visibility to passengers.
                </p>
                <button
                  onClick={() => navigate("/driver/driveredit")}
                  className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200"
                >
                  Complete Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {driverStats.totalTrips.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  This month: +{driverStats.completedTripsThisMonth}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Distance (KM)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {driverStats.totalKilometers.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  Avg trip: {driverStats.avgTripDuration}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Route className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Driver Rating
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {driverStats.customerSatisfaction}/5
                </p>
                <p className="text-sm text-yellow-600">
                  Based on {driverStats.totalPassengers.toLocaleString()}{" "}
                  passengers
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  On-Time Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {driverStats.onTimePercentage}%
                </p>
                <p className="text-sm text-green-600">Excellent performance</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "trips", label: "Trip History", icon: Bus },
                { id: "schedule", label: "Schedule", icon: Calendar },
                { id: "vehicle", label: "Vehicle Info", icon: Car },
                { id: "documents", label: "Documents", icon: FileText },
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
                  Driver Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {userData.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">
                        {userData.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">
                        {userData.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">
                        {userData.yearsOfExperience} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Emergency Contact</p>
                      <p className="font-medium text-gray-900">
                        {userData.emergencyContact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Route className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Current Route</p>
                      <p className="font-medium text-gray-900">
                        {userData.currentRoute || "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Employment Status</p>
                      <p className="font-medium text-gray-900">
                        {userData.employmentStatus || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Shift Preference</p>
                      <p className="font-medium text-gray-900">
                        {userData.shiftPreference || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  License & Vehicle
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">License Number</p>
                        <p className="font-medium text-gray-900">
                          {userData.licenseNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">License Expiry</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(userData.licenseExpiry)}
                        </p>
                        {licenseExpiryDays !== null && (
                          <p
                            className={`text-xs ${
                              expiryStatus.color === "red"
                                ? "text-red-600"
                                : expiryStatus.color === "yellow"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {licenseExpiryDays > 0
                              ? `${licenseExpiryDays} days remaining`
                              : "Expired"}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        expiryStatus.color === "red"
                          ? "bg-red-100 text-red-800"
                          : expiryStatus.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {expiryStatus.text}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Car className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Number</p>
                      <p className="font-medium text-gray-900">
                        {userData.vehicleNumber}
                      </p>
                    </div>
                  </div>

                  {licenseExpiryDays !== null && licenseExpiryDays <= 90 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            License Renewal Required
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Your driving license{" "}
                            {licenseExpiryDays <= 0
                              ? "has expired"
                              : `expires in ${licenseExpiryDays} days`}
                            . Please renew it as soon as possible.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Safe Driving Score
                    </span>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-green-600">
                        {driverStats.safeDrivingScore}/100
                      </span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${driverStats.safeDrivingScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Fuel Efficiency
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      {driverStats.fuelEfficiency} km/l
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Monthly Earnings
                    </span>
                    <span className="text-lg font-semibold text-purple-600">
                      LKR {driverStats.monthlyEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">
                      Completed trip to Kandy
                    </span>
                    <span className="ml-auto text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">
                      Started shift at 6:00 AM
                    </span>
                    <span className="ml-auto text-gray-400">6 hours ago</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">
                      Vehicle inspection completed
                    </span>
                    <span className="ml-auto text-gray-400">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "trips" && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Trip History
                </h3>
              </div>
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
                        Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
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
                          {trip.distance} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            {trip.rating}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Next Shift
                    </p>
                    <p className="text-lg font-semibold text-blue-900">
                      {driverStats.nextShift}
                    </p>
                    <p className="text-xs text-blue-600">
                      Route: {driverStats.currentRoute}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upcoming Shifts
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {upcomingShifts.map((shift) => (
                    <div key={shift.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {shift.route}
                            </p>
                            <p className="text-sm text-gray-500">
                              {shift.date}
                            </p>
                            <p className="text-xs text-gray-400">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {shift.busNumber}
                          </p>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {shift.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Weekly Schedule
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {userData.weeklySchedule &&
                      Object.entries(userData.weeklySchedule).map(
                        ([day, schedule]) => (
                          <div
                            key={day}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-3 ${
                                  schedule.isWorking
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <span className="font-medium text-gray-900 capitalize">
                                {day}
                              </span>
                            </div>
                            {schedule.isWorking ? (
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
              </div>

              {userData.preferredRoutes &&
                userData.preferredRoutes.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Preferred Routes
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {userData.preferredRoutes.map((route, index) => (
                          <span
                            key={index}
                            className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {route}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Work Preferences
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Maximum Working Hours
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData.maximumWorkingHours || 8} hours/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Available for Overtime
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        userData.availableForOvertime
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {userData.availableForOvertime ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "vehicle" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Number
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData.vehicleNumber}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      Inter-City Bus
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      45 Passengers
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      Diesel
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Maintenance Schedule
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-yellow-800">
                          Next Service Due
                        </p>
                        <p className="text-sm text-yellow-600">
                          {driverStats.vehicleMaintenanceDue}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                      Upcoming
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        98%
                      </div>
                      <div className="text-sm text-green-700">
                        Engine Health
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        95%
                      </div>
                      <div className="text-sm text-blue-700">Brake System</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        92%
                      </div>
                      <div className="text-sm text-purple-700">
                        Tire Condition
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Driving License
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          expiryStatus.color === "red"
                            ? "bg-red-100 text-red-800"
                            : expiryStatus.color === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {expiryStatus.text}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        License Number:{" "}
                        <span className="font-medium">
                          {userData.licenseNumber}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Expiry Date:{" "}
                        <span className="font-medium">
                          {formatDate(userData.licenseExpiry)}
                        </span>
                      </p>
                      {licenseExpiryDays !== null && (
                        <p
                          className={`text-sm ${
                            expiryStatus.color === "red"
                              ? "text-red-600"
                              : expiryStatus.color === "yellow"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {licenseExpiryDays > 0
                            ? `${licenseExpiryDays} days remaining`
                            : "Expired"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Medical Certificate
                      </h4>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Valid
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Issue Date:{" "}
                        <span className="font-medium">2024-06-15</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Expiry Date:{" "}
                        <span className="font-medium">2025-06-15</span>
                      </p>
                      <p className="text-sm text-green-600">
                        165 days remaining
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Document Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      View License
                    </span>
                  </button>
                  <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Upload Documents
                    </span>
                  </button>
                  <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Download Reports
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Picture
                  </h3>
                </div>
                <div className="p-6">
                  <ProfilePictureUpload
                    currentUser={userData}
                    onUpdate={handleSuccess}
                    onError={handleError}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Shift Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Get notified about upcoming shifts
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Route Updates</p>
                      <p className="text-sm text-gray-600">
                        Receive route change notifications
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Maintenance Alerts
                      </p>
                      <p className="text-sm text-gray-600">
                        Vehicle maintenance reminders
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
                  Privacy & Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">GPS Tracking</p>
                      <p className="text-sm text-gray-600">
                        Allow real-time location tracking
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Driving Analytics
                      </p>
                      <p className="text-sm text-gray-600">
                        Track driving patterns and efficiency
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Performance Reports
                      </p>
                      <p className="text-sm text-gray-600">
                        Weekly performance summaries
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
                  Data & Privacy
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Download My Data
                      </p>
                      <p className="text-sm text-gray-600">
                        Get a copy of your account data
                      </p>
                    </div>
                    <span className="text-blue-600">Download</span>
                  </button>

                  <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Privacy Settings
                      </p>
                      <p className="text-sm text-gray-600">
                        Manage your data sharing preferences
                      </p>
                    </div>
                    <span className="text-blue-600">Manage</span>
                  </button>
                </div>
              </div>

              <AccountDeletion
                currentUser={userData}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
