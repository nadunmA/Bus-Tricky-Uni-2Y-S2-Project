import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Crown,
  Download,
  Edit3,
  Eye,
  Filter,
  HeadphonesIcon,
  LayoutDashboard,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../services/api";
import { UserService } from "../services/UserService";
import { exportDriversToPDF, exportUsersToPDF } from "../utils/pdfExport";

const UserList = () => {
  const navigate = useNavigate();

  // State management
  const [allUsers, setAllUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    admin: 0,
    support: 0,
    driver: 0,
    passenger: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    driversWithLicenseExpiring: 0,
    driversWithoutSchedule: 0,
  });

  const handleProfileClick = () => {
    navigate("/admin/admindashboard");
  };

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [driverFilter, setDriverFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Selection and loading states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Advanced filter states
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [lastLoginFilter, setLastLoginFilter] = useState("");
  const [licenseExpiryFilter, setLicenseExpiryFilter] = useState(""); // New filter

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // mock data
  const mockUsers = [
    {
      id: 1,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phoneNumber: "+94 77 123 4567",
      role: "admin",
      isActive: true,
      lastLogin: "2025-08-31T10:30:00",
      createdAt: "2024-01-15",
      location: "Colombo",
      busAssigned: null,
    },
    {
      id: 2,
      firstName: "Mike",
      lastName: "Wilson",
      email: "mike.wilson@gmail.com",
      phoneNumber: "+94 77 345 6789",
      role: "driver",
      isActive: true,
      lastLogin: "2025-08-31T08:45:00",
      createdAt: "2024-03-10",
      location: "Gampaha",
      busAssigned: "B001",
      licenseNumber: "DL123456789",
      licenseExpiry: "2025-12-15",
      vehicleNumber: "WP CAB-1234",
      yearsOfExperience: "5-10",
      emergencyContact: "+94 77 999 8888",
      currentRoute: "Route 1 - Colombo to Kandy",
      employmentStatus: "full-time",
      shiftPreference: "morning",
      salary: 85000,
      weeklySchedule: {
        monday: {
          isWorking: true,
          startTime: "06:00",
          endTime: "14:00",
          route: "Route 1",
        },
        tuesday: {
          isWorking: true,
          startTime: "06:00",
          endTime: "14:00",
          route: "Route 1",
        },
        wednesday: {
          isWorking: true,
          startTime: "06:00",
          endTime: "14:00",
          route: "Route 1",
        },
        thursday: {
          isWorking: true,
          startTime: "06:00",
          endTime: "14:00",
          route: "Route 1",
        },
        friday: {
          isWorking: true,
          startTime: "06:00",
          endTime: "14:00",
          route: "Route 1",
        },
        saturday: { isWorking: false },
        sunday: { isWorking: false },
      },
      preferredRoutes: ["Route 1", "Route 3"],
      maximumWorkingHours: 8,
      availableForOvertime: true,
      medicalCertificateExpiry: "2025-06-15",
      bloodType: "A+",
    },
    {
      id: 3,
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@gmail.com",
      phoneNumber: "+94 77 456 7890",
      role: "driver",
      isActive: true,
      lastLogin: "2025-08-30T16:20:00",
      createdAt: "2024-05-20",
      location: "Kandy",
      busAssigned: "B002",
      licenseNumber: "DL987654321",
      licenseExpiry: "2025-03-20",
      vehicleNumber: "CP ABC-5678",
      yearsOfExperience: "3-5",
      emergencyContact: "+94 77 888 7777",
      currentRoute: "Route 2 - Kandy to Galle",
      employmentStatus: "part-time",
      shiftPreference: "afternoon",
      salary: 55000,
      weeklySchedule: {
        monday: { isWorking: false },
        tuesday: {
          isWorking: true,
          startTime: "14:00",
          endTime: "22:00",
          route: "Route 2",
        },
        wednesday: {
          isWorking: true,
          startTime: "14:00",
          endTime: "22:00",
          route: "Route 2",
        },
        thursday: {
          isWorking: true,
          startTime: "14:00",
          endTime: "22:00",
          route: "Route 2",
        },
        friday: { isWorking: false },
        saturday: {
          isWorking: true,
          startTime: "14:00",
          endTime: "22:00",
          route: "Route 2",
        },
        sunday: { isWorking: false },
      },
      preferredRoutes: ["Route 2"],
      maximumWorkingHours: 6,
      availableForOvertime: false,
      medicalCertificateExpiry: "2025-08-10",
      bloodType: "O+",
    },
  ];

  const transformUserData = (users) => {
    return users.map((user) => ({
      ...user,
      id: user._id || user.id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      phone: user.phoneNumber || user.phone,
      location: getLocationString(user), // Use the helper function here
      status:
        user.isActive === true
          ? "active"
          : user.isActive === false
          ? "inactive"
          : "suspended",

      licenseExpiryDays:
        user.role === "driver" && user.licenseExpiry
          ? Math.ceil(
              (new Date(user.licenseExpiry) - new Date()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      hasSchedule:
        user.role === "driver" && user.weeklySchedule
          ? Object.values(user.weeklySchedule).some((day) => day.isWorking)
          : false,
      workingDaysCount:
        user.role === "driver" && user.weeklySchedule
          ? Object.values(user.weeklySchedule).filter((day) => day.isWorking)
              .length
          : 0,
    }));
  };

  const getLocationString = (user) => {
    // If user has a location field as string
    if (user.location && typeof user.location === "string") {
      return user.location;
    }

    // If user has location as object
    if (user.location && typeof user.location === "object") {
      const parts = [];
      if (user.location.city) parts.push(user.location.city);
      if (user.location.state) parts.push(user.location.state);
      if (user.location.country) parts.push(user.location.country);
      if (parts.length > 0) return parts.join(", ");
    }

    // If user has separate location fields (city, state, country)
    const parts = [];
    if (user.city) parts.push(user.city);
    if (user.state) parts.push(user.state);
    if (user.country && user.country !== "Sri Lanka") parts.push(user.country);

    if (parts.length > 0) return parts.join(", ");

    // Fallback: just return country if available
    if (user.country) return user.country;

    return "Not specified";
  };

  // CLIENT-SIDE FILTERING - This is the key fix!
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((user) => {
        const fullName = `${user.firstName || ""} ${
          user.lastName || ""
        }`.toLowerCase();
        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const phone = user.phoneNumber || user.phone || "";

        return (
          fullName.includes(searchLower) ||
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((user) => {
        if (selectedStatus === "active")
          return user.isActive === true || user.status === "active";
        if (selectedStatus === "inactive")
          return user.isActive === false || user.status === "inactive";
        return user.status === selectedStatus;
      });
    }

    // Location filter
    if (locationFilter) {
      const locLower = locationFilter.toLowerCase();
      filtered = filtered.filter((u) =>
        u.location?.toLowerCase().includes(locLower)
      );
    }

    // Registration date filter
    if (dateFilter) {
      const fromDate = new Date(dateFilter);
      filtered = filtered.filter((u) => new Date(u.createdAt) >= fromDate);
    }

    // Last login filter
    if (lastLoginFilter) {
      let fromDate = new Date();
      if (lastLoginFilter === "today") {
        fromDate.setHours(0, 0, 0, 0);
      } else if (lastLoginFilter === "week") {
        fromDate.setDate(fromDate.getDate() - 7);
        fromDate.setHours(0, 0, 0, 0);
      } else if (lastLoginFilter === "month") {
        fromDate.setMonth(fromDate.getMonth() - 1);
        fromDate.setHours(0, 0, 0, 0);
      }
      filtered = filtered.filter((u) => new Date(u.lastLogin) >= fromDate);
    }

    // Driver-specific filters
    if (selectedRole === "driver" && driverFilter !== "all") {
      if (driverFilter === "license-expiring")
        filtered = filtered.filter(
          (d) => d.licenseExpiryDays !== null && d.licenseExpiryDays <= 90
        );
      if (driverFilter === "no-schedule")
        filtered = filtered.filter((d) => !d.hasSchedule);
      if (driverFilter === "overtime-available")
        filtered = filtered.filter((d) => d.availableForOvertime);
    }

    // License expiry filter
    if (licenseExpiryFilter && selectedRole === "driver") {
      if (licenseExpiryFilter === "expired") {
        filtered = filtered.filter((d) => d.licenseExpiryDays < 0);
      } else if (licenseExpiryFilter) {
        const days = parseInt(licenseExpiryFilter);
        filtered = filtered.filter(
          (d) => d.licenseExpiryDays <= days && d.licenseExpiryDays >= 0
        );
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "name") {
        aVal = a.name || `${a.firstName} ${a.lastName}`;
        bVal = b.name || `${b.firstName} ${b.lastName}`;
      } else if (
        sortBy === "createdAt" ||
        sortBy === "lastLogin" ||
        sortBy === "licenseExpiry"
      ) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    allUsers,
    searchTerm,
    selectedRole,
    selectedStatus,
    driverFilter,
    locationFilter,
    dateFilter,
    lastLoginFilter,
    licenseExpiryFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, usersPerPage]);

  const fetchUsers = useCallback(async (showRefreshIndicator = false) => {
    try {
      console.log("Fetching users from:", API_ENDPOINTS.USERS.BASE);

      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await UserService.getAllUsers({
        page: 1,
        limit: 1000,
        sortBy: "firstName",
        sortOrder: "asc",
      });
      console.log("Full API response:", response);

      if (response.success) {
        let userData = response.data || [];

        if (Array.isArray(userData)) {
          console.log("User data is an array with", userData.length, "items");
        } else if (userData && Array.isArray(userData.users)) {
          userData = userData.users;
        } else if (userData && typeof userData === "object") {
          if (userData.data && Array.isArray(userData.data)) {
            userData = userData.data;
          } else if (userData.users && Array.isArray(userData.users)) {
            userData = userData.users;
          } else if (userData.results && Array.isArray(userData.results)) {
            userData = userData.results;
          } else {
            userData = [];
          }
        } else {
          userData = [];
        }

        const transformedUsers = transformUserData(userData);
        setAllUsers(transformedUsers);
        calculateUserStats(transformedUsers);
      } else {
        console.error("API response not successful:", response);
        setError(response.message || "Failed to fetch users");

        const transformedMockUsers = transformUserData(mockUsers);
        setAllUsers(transformedMockUsers);
        calculateUserStats(transformedMockUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      let errorMessage = "Network error. Please check your connection.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please login as admin.";
        } else if (error.response.status === 403) {
          errorMessage = "Access denied. Admin privileges required.";
        } else {
          errorMessage =
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check if the backend is running on port 8000.";
      } else {
        errorMessage = error.message || "An unexpected error occurred.";
      }

      setError(errorMessage);

      const transformedMockUsers = transformUserData(mockUsers);
      setAllUsers(transformedMockUsers);
      calculateUserStats(transformedMockUsers);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const calculateUserStats = (userData) => {
    const drivers = userData.filter((u) => u.role === "driver");

    const stats = {
      total: userData.length,
      admin: userData.filter((u) => u.role === "admin").length,
      support: userData.filter(
        (u) => u.role === "support" || u.role === "support_staff"
      ).length,
      driver: drivers.length,
      passenger: userData.filter(
        (u) => u.role === "passenger" || u.role === "user"
      ).length,
      active: userData.filter(
        (u) => u.status === "active" || u.isActive === true
      ).length,
      inactive: userData.filter(
        (u) => u.status === "inactive" || u.isActive === false
      ).length,
      suspended: userData.filter((u) => u.status === "suspended").length,

      driversWithLicenseExpiring: drivers.filter(
        (d) => d.licenseExpiryDays !== null && d.licenseExpiryDays <= 90
      ).length,
      driversWithoutSchedule: drivers.filter((d) => !d.hasSchedule).length,
    };
    setUserStats(stats);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedRole,
    selectedStatus,
    locationFilter,
    dateFilter,
    lastLoginFilter,
    driverFilter,
    licenseExpiryFilter,
  ]);

  const handleRefresh = () => {
    fetchUsers(true);
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/userdetail/${userId}`);
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/useredit/${userId}`);
  };

  const handleDeleteUser = (userId) => {
    console.log("Delete button clicked for user ID:", userId);

    if (!userId) {
      console.error("No user ID provided");
      alert("Error: No user ID provided");
      return;
    }

    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const authToken =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!authToken) {
      console.error("No authentication token found");
      alert("Authentication required. Please login again.");
      navigate("/user/login");
      setShowDeleteModal(false);
      setUserToDelete(null);
      return;
    }

    try {
      console.log("Starting delete request...");

      if (localStorage.getItem("authToken") && !localStorage.getItem("token")) {
        localStorage.setItem("token", localStorage.getItem("authToken"));
      }

      const response = await UserService.deleteUser(userToDelete);

      if (response && response.success) {
        console.log("Delete successful");
        alert("User deleted successfully");
        await fetchUsers(true);
        setSelectedUsers((prev) => prev.filter((id) => id !== userToDelete));
      } else {
        console.error("Delete failed:", response);
        const errorMessage =
          response?.message ||
          response?.error?.message ||
          "Failed to delete user";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Delete error:", error);

      let errorMessage = "Error deleting user";

      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/user/login");
      } else if (error.response?.status === 403) {
        errorMessage = "Permission denied. Admin access required.";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found. They may have already been deleted.";
        await fetchUsers(true);
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        errorMessage =
          "Network error. Please check your connection and ensure the backend server is running.";
      }

      alert(errorMessage);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (window.confirm("Are you sure you want to suspend this user account?")) {
      try {
        const response = await UserService.suspendUser(userId);
        if (response.success) {
          alert("User account suspended successfully");
          await fetchUsers(true);
        } else {
          alert(response.message || "Failed to suspend user");
        }
      } catch (error) {
        console.error("Error suspending user:", error);
        alert("Error suspending user account");
      }
    }
  };

  const handleActivateUser = async (userId) => {
    if (
      window.confirm("Are you sure you want to activate this user account?")
    ) {
      try {
        const response = await UserService.activateUser(userId);
        if (response.success) {
          alert("User account activated successfully");
          await fetchUsers(true);
        } else {
          alert(response.message || "Failed to activate user");
        }
      } catch (error) {
        console.error("Error activating user:", error);
        alert("Error activating user account");
      }
    }
  };

  const handleBulkActivate = async () => {
    try {
      const response = await UserService.bulkUpdateUsers(
        selectedUsers.map((id) => ({ id, isActive: true }))
      );
      if (response.success) {
        fetchUsers(true);
        setSelectedUsers([]);
        alert("Users activated successfully");
      } else {
        alert(response.message || "Failed to activate users");
      }
    } catch (error) {
      console.error("Error activating users:", error);
      alert("Error activating users");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const response = await UserService.bulkUpdateUsers(
        selectedUsers.map((id) => ({ id, isActive: false }))
      );
      if (response.success) {
        fetchUsers(true);
        setSelectedUsers([]);
        alert("Users deactivated successfully");
      } else {
        alert(response.message || "Failed to deactivate users");
      }
    } catch (error) {
      console.error("Error deactivating users:", error);
      alert("Error deactivating users");
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedUsers.length} users?`
      )
    ) {
      try {
        const response = await UserService.bulkDeleteUsers(selectedUsers);
        if (response.success) {
          fetchUsers(true);
          setSelectedUsers([]);
          alert("Users deleted successfully");
        } else {
          alert(response.message || "Failed to delete users");
        }
      } catch (error) {
        console.error("Error bulk deleting users:", error);
        alert("Error deleting users");
      }
    }
  };

  const handleExport = async () => {
    try {
      const filters = {
        search: searchTerm,
        role: selectedRole !== "all" ? selectedRole : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        location: locationFilter || undefined,
        dateFrom: dateFilter || undefined,
        lastLogin: lastLoginFilter || undefined,
        driverFilter: driverFilter !== "all" ? driverFilter : undefined,
      };

      // Check if we're filtering by drivers specifically
      if (selectedRole === "driver") {
        // Export only drivers
        const drivers = filteredUsers.filter((user) => user.role === "driver");
        const result = exportDriversToPDF(drivers);

        if (result.success) {
          alert("Driver PDF export completed successfully!");
        } else {
          alert(result.message || "PDF export failed");
        }
      } else {
        // Export all users
        const result = exportUsersToPDF(filteredUsers, filters);

        if (result.success) {
          alert("PDF export completed successfully!");
        } else {
          alert(result.message || "PDF export failed");
        }
      }
    } catch (error) {
      console.error("Error exporting users:", error);
      alert("Error exporting data: " + error.message);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const currentPageUserIds = paginatedUsers.map((user) => user.id);
    if (selectedUsers.length === currentPageUserIds.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentPageUserIds);
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Crown className="w-4 h-4 text-purple-600" />;
      case "support":
      case "support_staff":
        return <HeadphonesIcon className="w-4 h-4 text-blue-600" />;
      case "driver":
        return <Car className="w-4 h-4 text-green-600" />;
      case "passenger":
      case "user":
        return <Users className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const roleKey = role?.toLowerCase();
    const configs = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      support: "bg-blue-100 text-blue-800 border-blue-200",
      support_staff: "bg-blue-100 text-blue-800 border-blue-200",
      driver: "bg-green-100 text-green-800 border-green-200",
      passenger: "bg-gray-100 text-gray-800 border-gray-200",
      user: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return configs[roleKey] || configs.user;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLicenseExpiryStatus = (days) => {
    if (days === null) return null;
    if (days < 0)
      return { color: "text-red-600", text: "Expired", icon: AlertTriangle };
    if (days <= 30)
      return {
        color: "text-red-600",
        text: "Expires Soon",
        icon: AlertTriangle,
      };
    if (days <= 90)
      return {
        color: "text-yellow-600",
        text: "Renewal Due",
        icon: AlertCircle,
      };
    return { color: "text-green-600", text: "Valid", icon: CheckCircle };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "??"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading users...</p>
          <p className="text-sm text-gray-500 mt-2">
            Connecting to:{" "}
            {import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Unable to load users</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="space-y-2 mb-4">
            <p className="text-xs text-gray-500">Troubleshooting:</p>
            <ul className="text-xs text-gray-500 text-left space-y-1">
              <li>• Make sure backend server is running on port 8000</li>
              <li>• Check if you're logged in as admin user</li>
              <li>• Verify MongoDB connection is working</li>
            </ul>
          </div>
          <button
            onClick={() => fetchUsers()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              const transformedMockUsers = transformUserData(mockUsers);
              setAllUsers(transformedMockUsers);
              calculateUserStats(transformedMockUsers);
              setError(null);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Use Sample Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage all system users and their permissions
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/user/signup")}
              className="bg-blue-600 flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
            <button
              onClick={handleProfileClick}
              className="flex items-center px-4 py-2 bg-green-200 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Go To Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {userStats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Admin</p>
            <p className="text-2xl font-bold text-purple-600">
              {userStats.admin}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Support</p>
            <p className="text-2xl font-bold text-blue-600">
              {userStats.support}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Drivers</p>
            <p className="text-2xl font-bold text-green-600">
              {userStats.driver}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Passengers</p>
            <p className="text-2xl font-bold text-gray-600">
              {userStats.passenger}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {userStats.active}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Inactive</p>
            <p className="text-2xl font-bold text-yellow-600">
              {userStats.inactive}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Suspended</p>
            <p className="text-2xl font-bold text-red-600">
              {userStats.suspended}
            </p>
          </div>
          {/* New Driver-specific Stats */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">License Expiring</p>
            <p className="text-2xl font-bold text-orange-600">
              {userStats.driversWithLicenseExpiring}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">No Schedule</p>
            <p className="text-2xl font-bold text-red-600">
              {userStats.driversWithoutSchedule}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="support">Support Staff</option>
              <option value="driver">Driver</option>
              <option value="passenger">Passenger</option>
              <option value="user">User</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {selectedRole === "driver" && (
              <select
                value={driverFilter}
                onChange={(e) => {
                  setDriverFilter(e.target.value);
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Drivers</option>
                <option value="license-expiring">License Expiring</option>
                <option value="no-schedule">No Schedule</option>
                <option value="overtime-available">
                  Available for Overtime
                </option>
              </select>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
                <span className="text-sm font-medium text-blue-700">
                  {selectedUsers.length} selected
                </span>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Date From
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Login
                </label>
                <select
                  value={lastLoginFilter}
                  onChange={(e) => setLastLoginFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {selectedRole === "driver" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Expiry
                  </label>
                  <select
                    value={licenseExpiryFilter}
                    onChange={(e) => setLicenseExpiryFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="30">Expires in 30 days</option>
                    <option value="90">Expires in 90 days</option>
                    <option value="expired">Already Expired</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Users ({totalUsers})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
                <option value="createdAt">Registration Date</option>
                <option value="lastLogin">Last Login</option>
                {selectedRole === "driver" && (
                  <>
                    <option value="licenseExpiry">License Expiry</option>
                    <option value="currentRoute">Current Route</option>
                    <option value="employmentStatus">Employment Status</option>
                  </>
                )}
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-13 gap-4 items-center text-sm font-medium text-gray-700">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={
                  selectedUsers.length === paginatedUsers.length &&
                  paginatedUsers.length > 0
                }
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-3">User</div>
            <div className="col-span-2">Role & Status</div>
            {selectedRole === "driver" ? (
              <>
                <div className="col-span-2">Driver Info</div>
                <div className="col-span-2">Schedule</div>
                <div className="col-span-1">License</div>
              </>
            ) : (
              <>
                <div className="col-span-2">Last Login</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1">Registered</div>
              </>
            )}
            <div className="col-span-1">Account Status</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <div
              key={user.id || user._id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-13 gap-4 items-center">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id || user._id)}
                    onChange={() => handleSelectUser(user.id || user._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role
                          ?.replace("_", " ")
                          ?.replace(/\b\w/g, (l) => l.toUpperCase()) || "User"}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        user.status
                      )}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${
                          user.status === "active"
                            ? "bg-green-500"
                            : user.status === "inactive"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {user.status?.charAt(0).toUpperCase() +
                        user.status?.slice(1) ||
                        (user.isActive ? "Active" : "Inactive")}
                    </span>
                  </div>
                </div>

                {selectedRole === "driver" || user.role === "driver" ? (
                  <>
                    <div className="col-span-2">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <Car className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-900">
                            {user.vehicleNumber || "Not assigned"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Route: {user.currentRoute || "Not assigned"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Experience:{" "}
                          {user.yearsOfExperience || "Not specified"}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Information */}
                    <div className="col-span-2">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-900">
                            {user.workingDaysCount || 0} days/week
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.shiftPreference ? (
                            <span className="capitalize">
                              {user.shiftPreference} shift
                            </span>
                          ) : (
                            "No preference"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.availableForOvertime ? (
                            <span className="text-green-600">
                              Available for OT
                            </span>
                          ) : (
                            <span className="text-gray-500">No OT</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* License Status */}
                    <div className="col-span-1">
                      {user.licenseExpiryDays !== null && (
                        <div className="text-sm">
                          {(() => {
                            const status = getLicenseExpiryStatus(
                              user.licenseExpiryDays
                            );
                            const Icon = status?.icon;
                            return status ? (
                              <div className="space-y-1">
                                <div
                                  className={`flex items-center space-x-1 ${status.color}`}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span className="text-xs font-medium">
                                    {status.text}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.licenseExpiryDays > 0
                                    ? `${user.licenseExpiryDays}d left`
                                    : "Expired"}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Regular user information */}
                    <div className="col-span-2">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {formatDate(user.lastLogin)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(user.lastLogin)}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-900">
                            {user.location || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <p className="text-sm text-gray-900">
                        {formatDate(user.createdAt || user.registeredDate)}
                      </p>
                    </div>
                  </>
                )}
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    {user.isActive ? (
                      <button
                        onClick={() => handleSuspendUser(user.id || user._id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                        title="Suspend Account"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Suspend</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateUser(user.id || user._id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                        title="Activate Account"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Activate</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewUser(user.id || user._id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View User"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleEditUser(user.id || user._id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id || user._id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {(selectedRole === "driver" || user.role === "driver") && (
                <div className="mt-3 grid grid-cols-13 gap-4 text-xs text-gray-500">
                  <div className="col-span-1"></div>
                  <div className="col-span-12 space-y-1">
                    <div className="flex items-center space-x-6">
                      {user.licenseNumber && (
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>License: {user.licenseNumber}</span>
                        </div>
                      )}
                      {user.emergencyContact && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>Emergency: {user.emergencyContact}</span>
                        </div>
                      )}
                      {user.employmentStatus && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">
                            {user.employmentStatus}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Joined{" "}
                          {formatDate(user.createdAt || user.registeredDate)}
                        </span>
                      </div>
                    </div>
                    {user.preferredRoutes &&
                      user.preferredRoutes.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-400">
                            Preferred Routes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {user.preferredRoutes
                              .slice(0, 3)
                              .map((route, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                                >
                                  {route}
                                </span>
                              ))}
                            {user.preferredRoutes.length > 3 && (
                              <span className="text-gray-400">
                                +{user.preferredRoutes.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {paginatedUsers.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * usersPerPage + 1} to{" "}
                {Math.min(currentPage * usersPerPage, totalUsers)} of{" "}
                {totalUsers} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedUsers.length} users selected
            </span>
            <div className="h-4 w-px bg-gray-300"></div>
            <button
              onClick={handleBulkActivate}
              className="flex items-center space-x-2 text-green-600 hover:text-green-800 text-sm font-medium"
            >
              <UserCheck className="w-4 h-4" />
              <span>Activate</span>
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              <UserX className="w-4 h-4" />
              <span>Deactivate</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRole === "driver" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              License Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">Valid</span>
                </div>
                <span className="text-green-600 font-bold">
                  {
                    filteredUsers.filter(
                      (u) => u.role === "driver" && u.licenseExpiryDays > 90
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-700">
                    Renewal Due
                  </span>
                </div>
                <span className="text-yellow-600 font-bold">
                  {
                    filteredUsers.filter(
                      (u) =>
                        u.role === "driver" &&
                        u.licenseExpiryDays <= 90 &&
                        u.licenseExpiryDays > 30
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-700">
                    Expiring Soon
                  </span>
                </div>
                <span className="text-red-600 font-bold">
                  {
                    filteredUsers.filter(
                      (u) => u.role === "driver" && u.licenseExpiryDays <= 30
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Employment Status
            </h4>
            <div className="space-y-3">
              {["full-time", "part-time", "contract", "temporary"].map(
                (status) => {
                  const count = filteredUsers.filter(
                    (u) => u.role === "driver" && u.employmentStatus === status
                  ).length;
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 capitalize">
                        {status.replace("-", " ")}
                      </span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Driver Report
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                View All Schedules
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-white text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                <AlertTriangle className="w-4 h-4 mr-2" />
                License Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
