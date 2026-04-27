"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking request?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (e) {
      alert("Error canceling booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="mt-3 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded hover:bg-red-500/20 transition-colors disabled:opacity-50 border border-red-500/20 w-full"
    >
      {loading ? "Canceling..." : "Cancel Booking"}
    </button>
  );
}
