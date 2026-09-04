'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

export default function EditModal({ 
  isOpen, 
  onClose, 
  field, 
  currentValue, 
  userId,
  onSuccess 
}) {
  const [value, setValue] = useState(currentValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // This effect will run whenever `isOpen` or `currentValue` changes.
    // We update the internal state to match the prop from the parent.
    if (isOpen) {
      setValue(currentValue);
      setError(''); // Also reset error on open
    }
  }, [isOpen, currentValue]);

  if (!isOpen) return null;

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const token = localStorage.getItem("jwt");
    
    await axios.put(
      `${process.env.NEXT_PUBLIC_API}/api/users`,
      { [field]: value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    onSuccess();
    onClose();
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const getFieldLabel = () => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">
            Edit {getFieldLabel()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label 
              htmlFor="editField" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {getFieldLabel()}
            </label>
            <input
              id="editField"
              type={field === 'phone_number' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded text-black hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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