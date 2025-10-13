import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileDown,
  Search,
  RefreshCw,
  Bus as BusIcon,
  Activity,
  AlertTriangle,
  Navigation,
  LayoutDashboard,
  Download,
  ArrowUpDown,
} from "lucide-react";

import jsPDF from "jspdf";
import "jspdf-autotable";

const BusTable = ({
  onAddNew,
  buses,
  loading,
  error,
  success,
  onEdit,
  onDelete,
  onRefresh,
  busStats,
  navigate: propNavigate,
}) => {
  const navigate = propNavigate || useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("bus_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const busesPerPage = 10;

  // Filter and sort buses
  const filteredBuses = buses
    .filter((bus) => {
      const query = searchQuery.toLowerCase();
      return (
        String(bus.busId || "")
          .toLowerCase()
          .includes(query) ||
        String(bus.bus_number || "")
          .toLowerCase()
          .includes(query) ||
        String(bus.driver_name || "")
          .toLowerCase()
          .includes(query) ||
        String(bus.bus_route || "")
          .toLowerCase()
          .includes(query)
      );
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalBuses = filteredBuses.length;
  const totalPages = Math.ceil(totalBuses / busesPerPage);
  const paginatedBuses = filteredBuses.slice(
    (currentPage - 1) * busesPerPage,
    currentPage * busesPerPage
  );

  const handleDownloadAllPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Bus Fleet Report", 14, 20);

    // Add summary
    doc.setFontSize(12);
    doc.text(`Total Buses: ${busStats?.total || buses.length}`, 14, 30);
    doc.text(`Active: ${busStats?.active || 0}`, 14, 37);
    doc.text(`Routes: ${busStats?.routes || 0}`, 14, 44);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 51);

    // Add table
    doc.autoTable({
      startY: 60,
      head: [["Bus ID", "Bus Number", "Driver Name", "Route", "Created"]],
      body: filteredBuses.map((bus) => [
        bus.busId,
        bus.bus_number,
        bus.driver_name,
        bus.bus_route,
        formatDate(bus.createdAt),
      ]),
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`bus-fleet-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleDownloadPDF = (bus) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Bus Details", 20, 20);

    // Add bus information
    doc.setFontSize(12);
    doc.text(`Bus ID: ${bus.busId}`, 20, 35);
    doc.text(`Bus Number: ${bus.bus_number}`, 20, 45);
    doc.text(`Driver Name: ${bus.driver_name}`, 20, 55);
    doc.text(`Route: ${bus.bus_route}`, 20, 65);
    doc.text(`Created: ${formatDate(bus.createdAt)}`, 20, 75);

    // Save the PDF
    doc.save(`bus-${bus.bus_number}.pdf`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading && buses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading buses...</p>
        </div>
      </div>
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
                  Bus Fleet Management
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Buses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {busStats?.total || buses.length}
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
                  {busStats?.active || 0}
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
                  {busStats?.routes || 0}
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
                  {busStats?.inactive || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bus Fleet</h2>
              <p className="text-gray-600 mt-1">Manage your bus fleet</p>
            </div>
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Add New Bus
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

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search buses..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600">
                  Found {filteredBuses.length} bus
                  {filteredBuses.length !== 1 ? "es" : ""} matching "
                  {searchQuery}"
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadAllPDF}
                className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bus Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Buses ({totalBuses})
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bus_number">Bus Number</option>
                  <option value="driver_name">Driver Name</option>
                  <option value="bus_route">Route</option>
                  <option value="createdAt">Created Date</option>
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBuses.map((bus) => (
                  <tr
                    key={bus._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bus.busId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600">
                        {bus.bus_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bus.driver_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bus.bus_route}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(bus.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDownloadPDF(bus)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                          title="Download PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(bus)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(bus._id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * busesPerPage + 1} to{" "}
                  {Math.min(currentPage * busesPerPage, totalBuses)} of{" "}
                  {totalBuses} buses
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded-lg text-sm font-medium ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && paginatedBuses.length === 0 && !searchQuery && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BusIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No buses found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first bus to the fleet
            </p>
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mx-auto font-medium"
            >
              <Plus className="h-5 w-5" />
              Add Your First Bus
            </button>
          </div>
        )}

        {/* Empty Search State */}
        {!loading && paginatedBuses.length === 0 && searchQuery && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No buses match your search
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusTable;
