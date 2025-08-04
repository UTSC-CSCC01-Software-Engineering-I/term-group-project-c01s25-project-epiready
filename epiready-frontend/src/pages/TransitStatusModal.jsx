import React, { useState } from 'react';

export default function TransitStatusModal({ open, onClose, onSubmit, loading, error }) {
  const [status, setStatus] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status.trim()) {
      onSubmit(status.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-neutral-900 rounded-xl p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-[#bfc9d1] text-center">Set Transit Status</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="px-4 py-2 rounded bg-neutral-800 text-white border border-[#869F77] focus:outline-none focus:border-[#6B805E]"
            placeholder="Enter new transit status..."
            value={status}
            onChange={e => setStatus(e.target.value)}
            disabled={loading}
            required
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded bg-[#6B805E] text-white hover:bg-[#4e6147] font-semibold"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
