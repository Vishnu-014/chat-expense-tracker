'use client';

import { useState } from 'react';
import { Calendar, X, Check } from 'lucide-react';

type DateMode = 'single' | 'range' | 'month' | 'multiple-months';

interface DateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dates: { mode: DateMode; value: string | string[] }) => void;
  currentSelection: string;
}

export default function DateSelector({
  isOpen,
  onClose,
  onApply,
  currentSelection,
}: DateSelectorProps) {
  const [mode, setMode] = useState<DateMode>('month');
  const [selectedDate, setSelectedDate] = useState<string>(currentSelection);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([
    currentSelection,
  ]);

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      months.push({ value: yearMonth, label });
    }
    return months;
  };

  const monthOptions = generateMonthOptions();

  const toggleMonth = (month: string) => {
    if (mode === 'multiple-months') {
      setSelectedMonths((prev) =>
        prev.includes(month)
          ? prev.filter((m) => m !== month)
          : [...prev, month]
      );
    } else {
      setSelectedDate(month);
    }
  };

  const handleApply = () => {
    let value: string | string[];

    switch (mode) {
      case 'single':
        value = selectedDate;
        break;
      case 'range':
        value = `${startDate}_${endDate}`;
        break;
      case 'month':
        value = selectedDate;
        break;
      case 'multiple-months':
        value = selectedMonths;
        break;
      default:
        value = selectedDate;
    }

    onApply({ mode, value });
    onClose();
  };

  const handleReset = () => {
    setMode('month');
    setSelectedDate(currentSelection);
    setStartDate('');
    setEndDate('');
    setSelectedMonths([currentSelection]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Mode Selector Pills */}
        <div className="p-6 border-b">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setMode('month')}
              className={`px-5 py-2 rounded-full font-medium transition border-2 ${
                mode === 'month'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Single Month
            </button>
            <button
              onClick={() => setMode('multiple-months')}
              className={`px-5 py-2 rounded-full font-medium transition border-2 ${
                mode === 'multiple-months'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Multiple Months
            </button>
            <button
              onClick={() => setMode('single')}
              className={`px-5 py-2 rounded-full font-medium transition border-2 ${
                mode === 'single'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Single Date
            </button>
            <button
              onClick={() => setMode('range')}
              className={`px-5 py-2 rounded-full font-medium transition border-2 ${
                mode === 'range'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Date Range
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Single Month or Multiple Months */}
          {(mode === 'month' || mode === 'multiple-months') && (
            <div className="space-y-3">
              {monthOptions.map((month) => (
                <button
                  key={month.value}
                  onClick={() => toggleMonth(month.value)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition ${
                    (mode === 'month' && selectedDate === month.value) ||
                    (mode === 'multiple-months' &&
                      selectedMonths.includes(month.value))
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {mode === 'multiple-months' && (
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedMonths.includes(month.value)
                            ? 'bg-white border-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedMonths.includes(month.value) && (
                          <Check className="w-4 h-4 text-slate-800" />
                        )}
                      </div>
                    )}
                    <span className="font-medium">{month.label}</span>
                  </div>
                  {mode === 'month' && selectedDate === month.value && (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Single Date */}
          {mode === 'single' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          )}

          {/* Date Range */}
          {mode === 'range' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
