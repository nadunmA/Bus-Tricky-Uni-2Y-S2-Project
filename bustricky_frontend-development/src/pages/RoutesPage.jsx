import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapIcon, SearchIcon, ArrowRightIcon, TruckIcon } from "lucide-react";
import axios from "axios";

export function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  // Fetch routes from backend
  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/routes");
      setRoutes(res.data);
      setFilteredRoutes(res.data);

      // Extract unique locations for dropdowns
      const allLocations = Array.from(
        new Set(res.data.flatMap((r) => [r.from, r.to]))
      );
      setLocations(allLocations);
    } catch (err) {
      console.error("Error fetching routes:", err);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Handle search/filter
  const handleSearch = () => {
    if (!fromLocation && !toLocation) {
      setFilteredRoutes(routes);
      return;
    }

    const filtered = routes.filter((route) => {
      const matchesFrom = !fromLocation || route.from === fromLocation;
      const matchesTo = !toLocation || route.to === toLocation;
      return matchesFrom && matchesTo;
    });

    setFilteredRoutes(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Bus Routes</h1>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                From
              </label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All departure locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">To</label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All arrival locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <SearchIcon size={18} className="mr-2" />
                Search Routes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">
          {filteredRoutes.length > 0
            ? `${filteredRoutes.length} Routes Found`
            : "No Routes Found"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoutes.map((route) => (
            <div
              key={route._id}
              className="relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={route.image || "https://via.placeholder.com/400x200"}
                  alt={`${route.from} to ${route.to}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              </div>

              {/* Card Content */}
              <div className="relative p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-lg font-semibold">
                    <span>{route.from}</span>
                    <ArrowRightIcon size={20} className="mx-2 text-gray-200" />
                    <span>{route.to}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-200">Distance</div>
                    <div className="font-medium">{route.distance}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-200">Duration</div>
                    <div className="font-medium">{route.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-200">Ticket Price</div>
                    <div className="font-medium text-yellow-300">
                      Rs. {route.price?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-200">Frequency</div>
                    <div className="font-medium">Every 30 mins</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-500">
                  <div className="flex items-center text-gray-200 text-sm">
                    <TruckIcon size={16} className="mr-1" />
                    <span>Multiple bus types available</span>
                  </div>
                  <Link
                    to={`/book-seats?from=${route.from}&to=${route.to}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Buses
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MapIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Routes Found
            </h3>
            <p className="text-gray-500 mb-4">
              Try changing your search criteria or check back later for new
              routes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
