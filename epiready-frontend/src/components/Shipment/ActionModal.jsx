
import React, { useState } from 'react';

const ActionModal = ({ isOpen, onClose, onSubmit, loading, error }) => {
  const [actionText, setActionText] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!actionText.trim()) {
      setLocalError('Action description cannot be empty.');
      return;
    }
    setLocalError('');
    onSubmit(actionText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Shipment Action</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={4}
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            placeholder="Describe the action taken..."
            disabled={loading}
          />
          {(localError || error) && (
            <div className="text-red-500 text-sm mb-2">{localError || error}</div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;
 