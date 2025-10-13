import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

export function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({
    from: "",
    to: "",
    distance: "",
    duration: "",
    price: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:8000/api/routes";

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setRoutes(res.data);
    } catch (err) {
      setError("Failed to fetch routes");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.distance || !form.duration || !form.price) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post(API_BASE, form);
      }

      setForm({ from: "", to: "", distance: "", duration: "", price: "" });
      setError("");
      await fetchRoutes();
    } catch (err) {
      setError("Failed to save route");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete route
  const deleteRoute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/${id}`);
      await fetchRoutes();
    } catch (err) {
      setError("Failed to delete route");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit route
  const editRoute = (route) => {
    setForm({
      from: route.from || "",
      to: route.to || "",
      distance: route.distance || "",
      duration: route.duration || "",
      price: route.price || "",
    });
    setEditingId(route.routeId || route._id);
  };

  const cancelEdit = () => {
    setForm({ from: "", to: "", distance: "", duration: "", price: "" });
    setEditingId(null);
    setError("");
  };

  // ✅ Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Bus Routes Report", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${currentDate}`, 14, 28);

    doc.setFontSize(12);
    doc.text(`Total Routes: ${routes.length}`, 14, 38);

    const headers = ["From", "To", "Distance", "Duration", "Price (Rs.)"];
    let y = 50;

    // Table header
    doc.setFont("helvetica", "bold");
    headers.forEach((header, i) => {
      doc.text(header, 14 + i * 35, y);
    });

    // Table rows
    doc.setFont("helvetica", "normal");
    y += 10;
    routes.forEach((r, index) => {
      doc.text(r.from || "-", 14, y);
      doc.text(r.to || "-", 49, y);
      doc.text(String(r.distance || "-"), 84, y);
      doc.text(String(r.duration || "-"), 119, y);
      doc.text(String(r.price || "-"), 154, y);
      y += 10;

      // Add new page if overflow
      if (y > 270 && index < routes.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("Routes_Report.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Routes</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {editingId && <p className="text-blue-600 mb-2">Editing route ID: {editingId}</p>}

      {/* Add/Edit Route Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="From"
          value={form.from}
          onChange={(e) => setForm({ ...form, from: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="To"
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Distance"
          value={form.distance}
          onChange={(e) => setForm({ ...form, distance: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Duration"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 w-full"
        />

        <div className="space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Loading..." : editingId ? "Update Route" : "Add Route"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}

          {/* ✅ Download PDF Button */}
          <button
            type="button"
            onClick={downloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download PDF
          </button>
        </div>
      </form>

      {/* Routes Table */}
      {loading && !routes.length ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">From</th>
              <th className="border p-2">To</th>
              <th className="border p-2">Distance</th>
              <th className="border p-2">Duration</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r._id}>
                <td className="border p-2">{r.from}</td>
                <td className="border p-2">{r.to}</td>
                <td className="border p-2">{r.distance}</td>
                <td className="border p-2">{r.duration}</td>
                <td className="border p-2">Rs. {r.price}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => editRoute(r)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRoute(r.routeId || r._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
