'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string | null, endDate: string | null) => void;
  currentStartDate: string | null;
  currentEndDate: string | null;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DateFilterModal({ 
  isOpen, 
  onClose, 
  onApply, 
  currentStartDate, 
  currentEndDate,
  anchorRef 
}: DateFilterModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(
    currentStartDate ? new Date(currentStartDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    currentEndDate ? new Date(currentEndDate) : null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11)); // December 2025
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStartDate(currentStartDate ? new Date(currentStartDate) : null);
    setEndDate(currentEndDate ? new Date(currentEndDate) : null);
  }, [currentStartDate, currentEndDate]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date);
      setEndDate(null);
    } else {
      // Set end date
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      // Format dates as YYYY-MM-DD
      const year1 = startDate.getFullYear();
      const month1 = String(startDate.getMonth() + 1).padStart(2, '0');
      const day1 = String(startDate.getDate()).padStart(2, '0');
      const start = `${year1}-${month1}-${day1}`;
      
      const year2 = endDate.getFullYear();
      const month2 = String(endDate.getMonth() + 1).padStart(2, '0');
      const day2 = String(endDate.getDate()).padStart(2, '0');
      const end = `${year2}-${month2}-${day2}`;
      
      onApply(start, end);
      onClose();
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    const today = new Date();
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, today);
      const isStart = isSameDay(date, startDate);
      const isEnd = isSameDay(date, endDate);
      const inRange = isInRange(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-10 flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
            isStart || isEnd
              ? 'bg-black text-white'
              : inRange
              ? 'bg-gray-200 text-gray-900'
              : isToday
              ? 'border-2 border-black text-gray-900'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-transparent bg-opacity-20" />
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Select Date Range</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-lg font-semibold">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar */}
        <div className="px-6 py-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500 font-medium h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>

        {/* Selected Range Display */}
        {startDate && (
          <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>From: {startDate.toLocaleDateString()}</span>
              {endDate && <span>To: {endDate.toLocaleDateString()}</span>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              startDate && endDate
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}