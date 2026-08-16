/**
 * formatters.js
 *
 * Utility functions for formatting data in PDF and API responses.
 */

/**
 * Format number as currency (INR)
 * @param {number} amount
 * @returns {string} formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date to readable format
 * @param {Date|string} date
 * @returns {string} formatted date string (e.g., "15-Aug-2024")
 */
export const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

/**
 * Format date and time to readable format
 * @param {Date|string} dateTime
 * @returns {string} formatted date-time string
 */
export const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    const d = new Date(dateTime);
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()} ${hours}:${minutes}`;
};

export default {
    formatCurrency,
    formatDate,
    formatDateTime,
};
