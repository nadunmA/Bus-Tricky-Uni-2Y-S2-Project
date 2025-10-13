import React, { useEffect, useState } from "react";
import {
  MapIcon,
  SearchIcon,
  ClockIcon,
  TruckIcon,
  InfoIcon,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { routes, buses } from "../utils/mockData";

// Fix for React-Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function TrackBus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBus, setSelectedBus] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch single bus location from backend
  const fetchBusLocation = async (busId) => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:8000/api/location", {
        busId,
      });

      const location_data = res.data[0];
      console.log("Fetched bus location data:", location_data);

      const data =
        res.data && res.data.latitude && res.data.longitude
          ? res.data
          : {
              latitude: location_data.latitude,
              longitude: location_data.longitude,
              lastUpdated: new Date().toLocaleTimeString(),
              status: "On Time",
              nextStop: "Warakapola",
              distanceToDestination: "58 km",
            };

      setBusLocation(data);
    } catch (error) {
      console.error("Error fetching bus location:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30s
  useEffect(() => {
    if (!selectedBus) return;
    fetchBusLocation(selectedBus.id);
    const interval = setInterval(() => fetchBusLocation(selectedBus.id), 30000);
    return () => clearInterval(interval);
  }, [selectedBus]);

  const handleSearch = () => {
    const found = buses.find(
      (b) =>
        b.id.toString().includes(searchQuery) ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) setSelectedBus(found);
  };

  const handleBusSelect = (bus) => {
    setSelectedBus(bus);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Track Your Bus</h1>

      {/* Search */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Enter Bus Number or Route
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bus number, route, or booking ID"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      {!selectedBus ? (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">
            Available Buses for Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleBusSelect(bus)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center">
                        <TruckIcon size={18} className="mr-2 text-blue-600" />
                        {bus.name}
                      </h3>
                      <p className="text-gray-600 mt-1">Bus #{bus.id}</p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-gray-700 mb-2">
                      <MapIcon size={16} className="mr-2" />
                      <span>
                        {bus.route.from} - {bus.route.to}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <ClockIcon size={16} className="mr-2" />
                      <span>
                        Departure: {bus.departureTime} | Arrival:{" "}
                        {bus.arrivalTime}
                      </span>
                    </div>
                  </div>
                  <button
                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => handleBusSelect(bus)}
                  >
                    Track This Bus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-blue-600 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <TruckIcon size={24} className="mr-2" />
                  {selectedBus.name} (Bus #{selectedBus.id})
                </h2>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="px-3 py-1 border border-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Change Bus
                </button>
              </div>
              <p className="mt-2">
                {selectedBus.route.from} - {selectedBus.route.to}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Map */}
                <div className="h-[400px] w-full rounded-md overflow-hidden">
                  {busLocation &&
                  busLocation.latitude &&
                  busLocation.longitude ? (
                    <MapContainer
                      center={[
                        Number(busLocation.latitude),
                        Number(busLocation.longitude),
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker
                        position={[
                          Number(busLocation.latitude),
                          Number(busLocation.longitude),
                        ]}
                      >
                        <Popup>
                          <strong>{selectedBus.name}</strong>
                          <br />
                          {busLocation.status}
                          <br />
                          Next stop: {busLocation.nextStop}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600">
                      {loading
                        ? "Fetching location..."
                        : "No location data yet."}
                    </div>
                  )}
                </div>

                {/* Info */}
                {busLocation && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">
                      Current Status
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {busLocation.lastUpdated}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className="text-green-600">
                          {busLocation.status}
                        </span>
                      </p>
                      <p>
                        <strong>Next Stop:</strong> {busLocation.nextStop}
                      </p>
                      <p>
                        <strong>Distance:</strong>{" "}
                        {busLocation.distanceToDestination}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Banner */}
              <div className="mt-6 bg-blue-50 p-4 rounded-md flex items-start">
                <InfoIcon
                  size={20}
                  className="text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                />
                <div>
                  <h4 className="font-medium text-blue-800">
                    Live Tracking Information
                  </h4>
                  <p className="text-blue-700 text-sm mt-1">
                    This page automatically refreshes every 30 seconds to show
                    the most up-to-date bus location and journey progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
