/**
 * formatters.js
 *
 * Utility functions for formatting data in PDF and API responses.
 */

/**
 * Format number as currency (INR-safe for PDFKit standard fonts)
 * @param {number} amount
 * @returns {string} formatted currency string (e.g., "Rs. 1,500.00")
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return "Rs. 0.00";
    }

    const num = Number(amount);
    const formattedNumber = num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `Rs. ${formattedNumber}`;
};

/**
 * Format date to readable format
 * @param {Date|string} date
 * @returns {string} formatted date string (e.g., "15-Aug-2024")
 */
export const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

/**
 * Format date and time to readable format
 * @param {Date|string} dateTime
 * @returns {string} formatted date-time string (e.g., "15-Aug-2024 14:30")
 */
export const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    const d = new Date(dateTime);
    if (isNaN(d.getTime())) return "-";

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()} ${hours}:${minutes}`;
};

export default {
    formatCurrency,
    formatDate,
    formatDateTime,
};