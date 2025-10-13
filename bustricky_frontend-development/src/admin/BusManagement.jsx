import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Save,
  Menu,
  Edit,
  Trash2,
  Loader2,
  Bus as BusIcon,
  Activity,
  AlertTriangle,
  Navigation,
  LayoutDashboard,
} from "lucide-react";

import BusTable from "../components/BusTable";

// API Base URL
const API_BASE_URL = "http://localhost:8000/api";

// API Service Functions
const busAPI = {
  // Get all buses
  getAllBuses: async () => {
    const response = await fetch(`${API_BASE_URL}/buses`);
    if (!response.ok) {
      throw new Error("Failed to fetch buses");
    }
    return response.json();
  },

  // Create new bus
  createBus: async (busData) => {
    const response = await fetch(`${API_BASE_URL}/buses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(busData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create bus");
    }
    return response.json();
  },

  // Update bus
  updateBus: async (id, busData) => {
    const response = await fetch(`${API_BASE_URL}/buses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(busData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update bus");
    }
    return response.json();
  },

  // Delete bus
  deleteBus: async (id) => {
    const response = await fetch(`${API_BASE_URL}/buses/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete bus");
    }
    return response.json();
  },
};

const BusManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Default to showing table view unless explicitly requesting form
  const [showForm, setShowForm] = useState(searchParams.get("view") === "form");

  const [formData, setFormData] = useState({
    bus_number: "",
    driver_name: "",
    bus_route: "",
  });
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingBus, setEditingBus] = useState(null);
  const [busStats, setBusStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    routes: 0,
  });

  // Fetch buses data
  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await busAPI.getAllBuses();
      const busData = response.data || [];
      setBuses(busData);

      // Calculate statistics
      const uniqueRoutes = new Set(busData.map((bus) => bus.bus_route)).size;
      setBusStats({
        total: busData.length,
        active: busData.filter((b) => b.isActive !== false).length,
        inactive: busData.filter((b) => b.isActive === false).length,
        routes: uniqueRoutes,
      });
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please make sure your backend is running on http://localhost:5000"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load buses when component mounts or when switching to table view
  useEffect(() => {
    if (!showForm) {
      fetchBuses();
    }
  }, [showForm]);

  const handleNavClick = (section) => {
    setSidebarOpen(false);

    switch (section) {
      case "dashboard":
        navigate("/admin/dashboard");
        break;
      case "bus-management":
        navigate("/admin/bus-management");
        break;
      case "route-management":
        navigate("/admin/routes");
        break;
      case "driver-approval":
        alert("Driver approval page coming soon!");
        break;
      default:
        alert(`Navigating to ${section}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for driver name - only letters and spaces
    if (name === "driver_name") {
      // Allow only letters (including unicode letters) and spaces
      const validDriverName = /^[a-zA-Z\s]*$/;
      if (!validDriverName.test(value)) {
        return; // Don't update if invalid characters are entered
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate bus number format (BUS-XXX)
    const busNumberPattern = /^BUS-\d{3}$/;
    if (!busNumberPattern.test(formData.bus_number)) {
      setError(
        'Bus number must be in format "BUS-001" (BUS- followed by 3 digits)'
      );
      return;
    }

    // Validate driver name - only letters and spaces
    const driverNamePattern = /^[a-zA-Z\s]+$/;
    if (!driverNamePattern.test(formData.driver_name)) {
      setError(
        "Driver name can only contain letters and spaces (no numbers or special symbols)"
      );
      return;
    }

    // Validate driver name is not empty after trim
    if (formData.driver_name.trim() === "") {
      setError("Driver name cannot be empty");
      return;
    }

    // Check if bus number already exists (only when adding new bus, not editing)
    if (!editingBus) {
      const existingBus = buses.find(
        (bus) =>
          bus.bus_number.toLowerCase() === formData.bus_number.toLowerCase()
      );
      if (existingBus) {
        setError(
          `Bus number "${formData.bus_number}" already exists! Please use a different bus number.`
        );
        alert(
          `Bus number "${formData.bus_number}" is already registered in the system. Please use a different bus number.`
        );
        return;
      }
    } else {
      // When editing, check if bus number exists in other buses (not the current one)
      const existingBus = buses.find(
        (bus) =>
          bus.bus_number.toLowerCase() === formData.bus_number.toLowerCase() &&
          bus._id !== editingBus._id
      );
      if (existingBus) {
        setError(
          `Bus number "${formData.bus_number}" already exists! Please use a different bus number.`
        );
        alert(
          `Bus number "${formData.bus_number}" is already registered to another bus. Please use a different bus number.`
        );
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (editingBus) {
        // Update existing bus
        await busAPI.updateBus(editingBus._id, formData);
        setSuccess("Bus updated successfully!");
      } else {
        // Create new bus
        await busAPI.createBus(formData);
        setSuccess("Bus created successfully!");
      }

      // Reset form and switch to table view
      setFormData({ bus_number: "", driver_name: "", bus_route: "" });
      setEditingBus(null);
      setShowForm(false);

      // Refresh the bus list to show the new/updated bus
      fetchBuses();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please make sure your backend is running on http://localhost:5000"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setFormData({ bus_number: "", driver_name: "", bus_route: "" });
    setEditingBus(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleEditBus = (bus) => {
    setFormData({
      bus_number: bus.bus_number,
      driver_name: bus.driver_name,
      bus_route: bus.bus_route,
    });
    setEditingBus(bus);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await busAPI.deleteBus(busId);
      setSuccess("Bus deleted successfully!");
      fetchBuses(); // Refresh the list

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please make sure your backend is running on http://localhost:5000"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <BusTable
        onAddNew={handleBackToForm}
        buses={buses}
        loading={loading}
        error={error}
        success={success}
        onEdit={handleEditBus}
        onDelete={handleDeleteBus}
        onRefresh={fetchBuses}
        busStats={busStats}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BusIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bus Management
                </h1>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Buses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {busStats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <BusIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {busStats.active}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Routes</p>
                <p className="text-3xl font-bold text-blue-600">
                  {busStats.routes}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Inactive</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {busStats.inactive}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {editingBus ? "Edit Bus" : "Add New Bus"}
              </h2>
              <p className="text-gray-600 mt-2">
                {editingBus
                  ? "Update bus information"
                  : "Add a new bus to the fleet"}
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              View All Buses
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
            <Activity className="h-5 w-5 mr-3" />
            {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bus Number */}
              <div>
                <label
                  htmlFor="bus_number"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bus Number *
                </label>
                <input
                  type="text"
                  id="bus_number"
                  name="bus_number"
                  value={formData.bus_number}
                  onChange={handleInputChange}
                  placeholder="e.g., BUS-001"
                  pattern="BUS-\d{3}"
                  title="Bus number must be in format BUS-001 (BUS- followed by 3 digits)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: BUS-001 (BUS- followed by 3 digits)
                </p>
              </div>

              {/* Driver Name */}
              <div>
                <label
                  htmlFor="driver_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Driver Name *
                </label>
                <input
                  type="text"
                  id="driver_name"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Dasun Kumar"
                  pattern="[a-zA-Z\s]+"
                  title="Driver name can only contain letters and spaces"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only letters and spaces allowed
                </p>
              </div>
            </div>

            {/* Bus Route */}
            <div>
              <label
                htmlFor="bus_route"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bus Route *
              </label>
              <input
                type="text"
                id="bus_route"
                name="bus_route"
                value={formData.bus_route}
                onChange={handleInputChange}
                placeholder="e.g., Negombo - Malabe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {loading
                  ? editingBus
                    ? "Updating..."
                    : "Adding..."
                  : editingBus
                  ? "Update Bus"
                  : "Add Bus"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BusManagement;
