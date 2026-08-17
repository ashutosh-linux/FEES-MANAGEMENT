import React, { useState } from "react";
import axios from "axios";

export default function InvoiceActions({ billId, billNumber }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const fetchPdfBlob = async () => {
        const token = localStorage.getItem("token");

        const response = await axios.get(`/api/bills/${billId}/pdf`, {
            responseType: "blob",
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        return new Blob([response.data], { type: "application/pdf" });
    };

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            const blob = await fetchPdfBlob();

            const fileUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = fileUrl;
            link.setAttribute("download", `Invoice_${billNumber || billId}.pdf`);
            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(fileUrl);
        } catch (err) {
            console.error("Failed to download invoice:", err);
            alert("Unable to download invoice. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleView = async () => {
        try {
            setIsViewing(true);
            const blob = await fetchPdfBlob();
            const fileUrl = window.URL.createObjectURL(blob);
            window.open(fileUrl, "_blank");

            setTimeout(() => window.URL.revokeObjectURL(fileUrl), 10000);
        } catch (err) {
            console.error("Failed to view invoice:", err);
            alert("Unable to preview invoice.");
        } finally {
            setIsViewing(false);
        }
    };

    return (
        <div style={{ display: "inline-flex", gap: "6px" }}>
            <button
                type="button"
                onClick={handleView}
                disabled={isViewing || isDownloading}
                style={{
                    padding: "5px 10px",
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    cursor: isViewing ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                }}
            >
                {isViewing ? "Opening..." : "View"}
            </button>

            <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading || isViewing}
                style={{
                    padding: "5px 10px",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                }}
            >
                {isDownloading ? "Downloading..." : "Download"}
            </button>
        </div>
    );
}