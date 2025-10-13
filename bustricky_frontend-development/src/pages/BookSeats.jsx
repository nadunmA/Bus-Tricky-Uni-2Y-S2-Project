// src/pages/BookSeats.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BusIcon,
  ClockIcon,
  MapPinIcon,
  WifiIcon,
  UsbIcon,
  BatteryChargingIcon,
  AlignJustifyIcon,
  SearchIcon,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export function BookSeats() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [fromLocation, setFromLocation] = useState(
    searchParams.get("from") || ""
  );
  const [toLocation, setToLocation] = useState(searchParams.get("to") || "");
  const [date, setDate] = useState("");
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Check authentication status on component mount
  useEffect(() => {
    // Check both AuthContext AND localStorage for authentication
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");

    console.log("Authentication check:", {
      isAuthenticated,
      user,
      token,
      userInfo,
    });

    // Mark as checked after a brief delay to allow context to update
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Fetch routes from backend
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/routes");
        setRoutes(res.data);

        // Extract unique "from" and "to" locations
        const uniqueLocations = [
          ...new Set(res.data.flatMap((r) => [r.from, r.to])),
        ];
        setLocations(uniqueLocations);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };

    fetchRoutes();
  }, []);

  // Check authentication after auth context has loaded
  useEffect(() => {
    if (!authChecked) return; // Wait for auth check to complete

    // Check localStorage as fallback if context hasn't updated
    const token = localStorage.getItem("token");
    const hasAuth = isAuthenticated || !!token;

    if (!hasAuth) {
      console.log("User not authenticated, redirecting to login");
      alert("Please login to book seats");
      navigate("/login");
      return;
    }

    // Auto-search if URL has params
    if (fromLocation && toLocation && date) {
      handleSearch();
    }
  }, [authChecked, isAuthenticated, fromLocation, toLocation, date]);

  const handleSearch = () => {
    if (!fromLocation || !toLocation || !date) {
      alert("Please fill all the fields");
      return;
    }

    // Filter routes for the selected locations
    const filteredRoutes = routes.filter(
      (r) => r.from === fromLocation && r.to === toLocation
    );
    setSearchResults(filteredRoutes);
    setHasSearched(true);
  };

  const handleSelectBus = (route) => {
    // Check both context and localStorage for authentication
    const token = localStorage.getItem("token");
    const hasAuth = isAuthenticated || !!token;

    if (!hasAuth) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    // Use route._id or routeId based on your route structure
    const routeIdentifier = route.routeId || route._id;

    navigate(`/seat-selection/${routeIdentifier}?date=${date}`, {
      state: { route },
    });
  };

  const renderFacilityIcons = (facilities = []) => (
    <div className="flex space-x-2">
      {facilities.includes("AC") && (
        <BatteryChargingIcon size={16} className="text-blue-600" title="AC" />
      )}
      {facilities.includes("WiFi") && (
        <WifiIcon size={16} className="text-blue-600" title="WiFi" />
      )}
      {facilities.includes("USB Charging") && (
        <UsbIcon size={16} className="text-blue-600" title="USB Charging" />
      )}
      {facilities.includes("Reclining Seats") && (
        <AlignJustifyIcon
          size={16}
          className="text-blue-600"
          title="Reclining Seats"
        />
      )}
    </div>
  );

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render the rest if not authenticated (will redirect)
  // Check localStorage as well since context might not be updated yet
  const token = localStorage.getItem("token");
  if (!isAuthenticated && !token) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Book Your Bus Seats
      </h1>

      {/* User Info Display */}
      {(user || localStorage.getItem("userInfo")) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">
            Welcome,{" "}
            {user?.firstName ||
              user?.name ||
              user?.email ||
              JSON.parse(localStorage.getItem("userInfo") || "{}").firstName ||
              "User"}
            ! You can now book your seats.
          </p>
        </div>
      )}

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* From */}
          <div>
            <label className="block text-gray-700 font-medium">From</label>
            <select
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select departure location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div>
            <label className="block text-gray-700 font-medium">To</label>
            <select
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select arrival location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium">Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <SearchIcon size={18} className="mr-2" /> Search Buses
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {searchResults.length > 0
              ? `Available Buses from ${fromLocation} to ${toLocation}`
              : `No buses found for ${fromLocation} to ${toLocation}`}
          </h2>

          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((route) => (
                <div
                  key={route._id || route.routeId}
                  className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-bold flex items-center">
                      <BusIcon size={20} className="mr-2 text-blue-600" />
                      {route.from} → {route.to}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Distance: {route.distance} km | Duration: {route.duration}{" "}
                      hrs
                    </p>
                    <p className="text-gray-600 mt-1">
                      Price: Rs. {route.price.toLocaleString()}
                    </p>
                    {renderFacilityIcons(route.facilities)}
                  </div>
                  <button
                    onClick={() => handleSelectBus(route)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Select Seats
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">
                No buses available. Please try a different route or date.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
