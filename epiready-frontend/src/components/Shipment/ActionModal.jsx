import React, { useState } from "react";

export default function ActionModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  error = ""
}) {
  const [actionInput, setActionInput] = useState("");
  const [actionType, setActionType] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    if (actionInput.trim()) {
      setLocalError("");
      onSubmit(actionInput.trim(), () => setActionInput(""));
    } else {
      setLocalError("Action cannot be empty");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-neutral-800 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col">
        <h2 className="text-2xl font-bold text-[#bfc9d1] mb-4 text-center">Add Action</h2>
        <textarea
          className="w-full rounded p-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-700 mb-4"
          rows={3}
          value={actionInput}
          onChange={e => setActionInput(e.target.value)}
          placeholder="Describe the action taken..."
          disabled={loading}
        />
        <input
        type="text"
          className="w-full rounded p-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-700 mb-4"
          value={actionType}
          onChange={e => setActionType(e.target.value)}
          placeholder="Describe the action type..."
          disabled={loading}
        />
        {(localError || error) && (
          <div className="text-red-400 text-center mb-2">{localError || error}</div>
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
              setActionInput("");
              setLocalError("");
              onClose();
            }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
