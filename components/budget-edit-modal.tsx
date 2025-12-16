'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BudgetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSave: (budget: number) => void;
}

export function BudgetEditModal({
  isOpen,
  onClose,
  currentBudget,
  onSave,
}: BudgetEditModalProps) {
  const [budget, setBudget] = useState(currentBudget.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBudget(currentBudget.toString());
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(budgetValue);
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Budget</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Budget (₹)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter budget amount"
              min="0"
              step="100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                isSaving
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
