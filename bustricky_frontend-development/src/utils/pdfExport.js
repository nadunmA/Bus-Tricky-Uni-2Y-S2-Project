import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper function to extract location string from various formats
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

export const exportUsersToPDF = (users = [], filters = {}) => {
  try {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("All Users Report", 20, 20);

    // Date and filters info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Users: ${users.length}`, 20, 35);

    // Add filter information if any
    let yPosition = 40;
    if (filters.role && filters.role !== "all") {
      doc.text(`Role Filter: ${filters.role}`, 20, yPosition);
      yPosition += 5;
    }
    if (filters.status && filters.status !== "all") {
      doc.text(`Status Filter: ${filters.status}`, 20, yPosition);
      yPosition += 5;
    }
    if (filters.search) {
      doc.text(`Search Term: ${filters.search}`, 20, yPosition);
      yPosition += 5;
    }

    // Table columns
    const tableColumns = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Phone",
      "Location",
      "Registration Date",
    ];

    // Table rows - FIXED to handle location objects and separate fields
    const tableRows = users.map((user) => [
      user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "N/A",
      user.email || "-",
      (user.role || "user").charAt(0).toUpperCase() +
        (user.role || "user").slice(1),
      user.status || (user.isActive ? "Active" : "Inactive"),
      user.phone || user.phoneNumber || "-",
      // FIXED: Use helper function with the whole user object
      getLocationString(user),
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-",
    ]);

    // Generate table using autoTable - FIXED column widths to fit page
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: yPosition + 10,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { top: 20, left: 10, right: 10, bottom: 20 },
      columnStyles: {
        0: { cellWidth: 23 }, // Name - reduced
        1: { cellWidth: 38 }, // Email - increased for long emails
        2: { cellWidth: 18 }, // Role - reduced
        3: { cellWidth: 18 }, // Status - reduced
        4: { cellWidth: 23 }, // Phone - reduced
        5: { cellWidth: 28 }, // Location - adjusted
        6: { cellWidth: 22 }, // Registration Date - reduced
      },
      // Total width = 23+38+18+18+23+28+22 = 170 (fits within ~190 page width with margins)
    });

    const fileName = `all_users_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);

    return { success: true, message: "PDF exported successfully" };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      message: "Failed to generate PDF: " + error.message,
    };
  }
};

export const exportDriversToPDF = (drivers = []) => {
  try {
    // Use landscape orientation for drivers table (more columns)
    const doc = new jsPDF('landscape');

    doc.setFontSize(20);
    doc.text("Driver Report", 20, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Drivers: ${drivers.length}`, 20, 35);

    const tableColumns = [
      "Name",
      "Email",
      "Phone",
      "License No.",
      "License Expiry",
      "Vehicle",
      "Route",
      "Location",
      "Employment",
      "Status",
    ];

    // FIXED: Use helper function for location with whole user object
    const tableRows = drivers.map((driver) => [
      driver.name ||
        `${driver.firstName || ""} ${driver.lastName || ""}`.trim() ||
        "N/A",
      driver.email || "-",
      driver.phone || driver.phoneNumber || "-",
      driver.licenseNumber || "-",
      driver.licenseExpiry
        ? new Date(driver.licenseExpiry).toLocaleDateString()
        : "-",
      driver.vehicleNumber || "-",
      driver.currentRoute || "-",
      // FIXED: Use helper function with whole driver object
      getLocationString(driver),
      driver.employmentStatus || "-",
      driver.status || (driver.isActive ? "Active" : "Inactive"),
    ]);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [34, 139, 34], textColor: 255, fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 20, left: 10, right: 10, bottom: 20 },
      columnStyles: {
        0: { cellWidth: 25 },  // Name
        1: { cellWidth: 35 },  // Email
        2: { cellWidth: 22 },  // Phone
        3: { cellWidth: 23 },  // License No.
        4: { cellWidth: 24 },  // License Expiry
        5: { cellWidth: 22 },  // Vehicle
        6: { cellWidth: 30 },  // Route
        7: { cellWidth: 25 },  // Location
        8: { cellWidth: 22 },  // Employment
        9: { cellWidth: 18 },  // Status
      },
      // Landscape page width is ~280, these columns total ~246
    });

    const fileName = `drivers_report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);

    return { success: true, message: "PDF exported successfully" };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      message: "Failed to generate PDF: " + error.message,
    };
  }
};

// Enhanced version with landscape orientation for all users
export const exportUsersToLandscapePDF = (users = [], filters = {}) => {
  try {
    // Use landscape orientation for more space
    const doc = new jsPDF('landscape');

    doc.setFontSize(20);
    doc.text("All Users Report", 20, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Users: ${users.length}`, 20, 35);

    let yPosition = 40;
    if (filters.role && filters.role !== "all") {
      doc.text(`Role Filter: ${filters.role}`, 20, yPosition);
      yPosition += 5;
    }
    if (filters.status && filters.status !== "all") {
      doc.text(`Status Filter: ${filters.status}`, 20, yPosition);
      yPosition += 5;
    }
    if (filters.search) {
      doc.text(`Search Term: ${filters.search}`, 20, yPosition);
      yPosition += 5;
    }

    const tableColumns = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Phone",
      "Location",
      "Registration Date",
    ];

    const tableRows = users.map((user) => [
      user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "N/A",
      user.email || "-",
      (user.role || "user").charAt(0).toUpperCase() +
        (user.role || "user").slice(1),
      user.status || (user.isActive ? "Active" : "Inactive"),
      user.phone || user.phoneNumber || "-",
      // FIXED: Use helper function with whole user object
      getLocationString(user),
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-",
    ]);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: yPosition + 10,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontSize: 10 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { top: 20, left: 10, right: 10, bottom: 20 },
      columnStyles: {
        0: { cellWidth: 32 },  // Name - more space
        1: { cellWidth: 52 },  // Email - more space
        2: { cellWidth: 24 },  // Role
        3: { cellWidth: 24 },  // Status
        4: { cellWidth: 30 },  // Phone
        5: { cellWidth: 38 },  // Location - more space
        6: { cellWidth: 30 },  // Registration Date
      },
      // Landscape page width is ~280, these columns total ~230
    });

    const fileName = `all_users_landscape_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);

    return { success: true, message: "PDF exported successfully" };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      message: "Failed to generate PDF: " + error.message,
    };
  }
};