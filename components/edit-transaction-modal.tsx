'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import {
  TrendingDown,
  TrendingUp,
  ChartCandlestick,
  PiggyBank,
} from 'lucide-react';

type ParsedData = {
  text: string;
  amount: number;
  category: string;
  transaction_type: 'EXPENSE' | 'INCOME' | 'INVESTMENTS' | 'SAVINGS';
  tags: string[];
  sentiment?: number;
  location?: string;
  timestamp: string;
  year: number;
  month: number;
  year_month: string;
  month_name: string;
  year_month_key: string;
};

const COLORS = {
  EXPENSE: '#E55F78',
  INCOME: '#74C4BB',
  INVESTMENTS: '#A3CDF3',
  SAVINGS: '#F6DB87',
};

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedData;
  createdAt: string;
  onSave: (updates: Partial<ParsedData> & { createdAt?: string }) => void;
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  parsedData,
  createdAt,
  onSave,
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState(parsedData.amount.toString());
  const [category, setCategory] = useState(parsedData.category);
  const [transactionType, setTransactionType] = useState(
    parsedData.transaction_type
  );
  const [tags, setTags] = useState<string[]>(parsedData.tags);
  const [newTag, setNewTag] = useState('');
  const [date, setDate] = useState(
    new Date(createdAt).toISOString().split('T')[0]
  );
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(parsedData.amount.toString());
      setCategory(parsedData.category);
      setTransactionType(parsedData.transaction_type);
      setTags(parsedData.tags);
      setDate(new Date(createdAt).toISOString().split('T')[0]);
    }
  }, [isOpen, parsedData, createdAt]);

  const transactionTypes = [
    {
      value: 'EXPENSE' as const,
      label: 'Expense',
      color: COLORS.EXPENSE,
      icon: TrendingDown,
    },
    {
      value: 'INCOME' as const,
      label: 'Income',
      color: COLORS.INCOME,
      icon: TrendingUp,
    },
    {
      value: 'INVESTMENTS' as const,
      label: 'Investments',
      color: COLORS.INVESTMENTS,
      icon: ChartCandlestick,
    },
    {
      value: 'SAVINGS' as const,
      label: 'Savings',
      color: COLORS.SAVINGS,
      icon: PiggyBank,
    },
  ];

  const handleSave = () => {
    const selectedDate = new Date(date);
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    const updates = {
      'parsedData.amount': parseFloat(amount),
      'parsedData.category': category,
      'parsedData.transaction_type': transactionType,
      'parsedData.tags': tags,
      'parsedData.year': year,
      'parsedData.month': month,
      'parsedData.year_month': `${year}-${month.toString().padStart(2, '0')}`,
      'parsedData.month_name': selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      'parsedData.year_month_key': `${year}-${month
        .toString()
        .padStart(2, '0')}`,
      createdAt: selectedDate.toISOString(),
    };

    onSave(updates);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  const selectedType = transactionTypes.find(
    (t) => t.value === transactionType
  );
  const SelectedIcon = selectedType?.icon || TrendingDown;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Edit Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <div className="relative">
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: selectedType?.color }}
                  >
                    <SelectedIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    {selectedType?.label}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10">
                  {transactionTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => {
                          setTransactionType(type.value);
                          setIsTypeDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: type.color }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-slate-700">{type.label}</span>
                        </div>
                        {transactionType === type.value && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
