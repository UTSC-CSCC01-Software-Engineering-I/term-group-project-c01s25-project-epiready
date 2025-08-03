import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

export default function ShipmentStatus({
  open,
  onClose,
  onSubmit,
  currentStatus,
  loading = false,
  error = "",
}) {
  const [status, setStatus] = useState(currentStatus);
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    onSubmit(status);
  };

  return (
    <Popup
      open={open}
      onClose={onClose}
      modal
      closeOnDocumentClick
      contentStyle={{
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        border: "none",
        width: "95vw",
        maxWidth: "400px",
        minWidth: "0",
      }}
      overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="relative bg-neutral-800 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col">
        <button
          className="absolute top-0 right-1 text-gray-600 text-4xl font-bold hover:text-blue-900 transition"
          onClick={() => {
            setLocalError("");
            onClose();
          }}
          aria-label="Close"
          disabled={loading}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-[#bfc9d1] mb-4 text-center">
          Shipment Status
        </h2>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
          }}
          className="p-4 mb-2"
        >
          <option value="active" className="text-gray-900">
            Active
          </option>
          <option value="completed" className="text-gray-900">
            Completed
          </option>
          <option value="cancelled" className="text-gray-900">
            Cancelled
          </option>
        </select>
        {(localError || error) && (
          <div className="text-red-400 text-center mb-2">
            {localError || error}
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button
            className="px-4 py-2 rounded bg-[#6B805E] text-white font-semibold hover:bg-[#4e6147] focus:bg-[#4e6147] transition"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            className="px-4 py-2 rounded bg-neutral-700 text-white font-semibold hover:bg-neutral-600 focus:bg-neutral-600 transition"
            onClick={() => {
              setLocalError("");
              onClose();
            }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </Popup>
  );
}
