'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import {
  ChevronLeft,
  Home,
  MessageCircle,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { getCategoryIcon } from '@/lib/category-icons';
import { CategoryRow } from '@/components/category-row';
import { SegmentToggle } from '@/components/segment-toggle';
import { DateFilterModal } from '@/components/date-filter-modal';

/* -------------------- CONSTANTS -------------------- */
const COLORS = {
  EXPENSE: '#E55F78',
  INCOME: '#74C4BB',
  INVESTMENTS: '#A3CDF3',
  SAVINGS: '#F6DB87',
  BACKGROUND: '#152D37',
} as const;

/* -------------------- TYPES -------------------- */
type TransactionType = 'EXPENSE' | 'INCOME' | 'INVESTMENTS' | 'SAVINGS';
type FilterType = 'Exp' | 'Inc' | 'Inv' | 'Sav';

const FILTER_TO_TYPE: Record<FilterType, TransactionType> = {
  Exp: 'EXPENSE',
  Inc: 'INCOME',
  Inv: 'INVESTMENTS',
  Sav: 'SAVINGS',
};

interface CategoryAnalytics {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface Analytics {
  expense: number;
  income: number;
  investments: number;
  savings: number;
  categories: Record<TransactionType, CategoryAnalytics[]>;
  tags: Record<TransactionType, CategoryAnalytics[]>;
}

/* -------------------- COMPONENT -------------------- */
function CategoriesContent() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Exp');
  const [activeTab, setActiveTab] = useState<'Categories' | 'Tags'>(
    'Categories'
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<string | null>('2025-12-01');
  const [endDate, setEndDate] = useState<string | null>('2025-12-31');
  const [dateLabel, setDateLabel] = useState("Dec'25");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  // Reset showAllCategories and showAllTags when filter or tab changes
  useEffect(() => {
    setShowAllCategories(false);
    setShowAllTags(false);
  }, [selectedFilter, activeTab]);

  /* -------------------- FETCH -------------------- */
  useEffect(() => {
    if (user && token) {
      fetchAnalytics();
    }
  }, [user, token, startDate, endDate]);

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      // Build query params
      let queryParams = '';
      if (startDate && endDate) {
        queryParams = `startDate=${startDate}&endDate=${endDate}`;
      } else {
        // Default to current month
        queryParams = 'month=2025-12';
      }

      const response = await fetch(`/api/analytics?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- DATE HANDLING -------------------- */
  const handleDateApply = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);

    // Update label
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      if (
        startDateObj.getFullYear() === endDateObj.getFullYear() &&
        startDateObj.getMonth() === endDateObj.getMonth()
      ) {
        // Same month
        setDateLabel(
          `${monthNames[startDateObj.getMonth()]}'${startDateObj
            .getFullYear()
            .toString()
            .slice(2)}`
        );
      } else if (startDateObj.getFullYear() === endDateObj.getFullYear()) {
        // Same year, different months
        setDateLabel(
          `${monthNames[startDateObj.getMonth()]}-${
            monthNames[endDateObj.getMonth()]
          }'${startDateObj.getFullYear().toString().slice(2)}`
        );
      } else {
        // Different years
        setDateLabel(
          `${monthNames[startDateObj.getMonth()]}'${startDateObj
            .getFullYear()
            .toString()
            .slice(2)}-${monthNames[endDateObj.getMonth()]}'${endDateObj
            .getFullYear()
            .toString()
            .slice(2)}`
        );
      }
    }
  };

  /* -------------------- LOADING -------------------- */
  if (isLoading || !analytics) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.BACKGROUND }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  /* -------------------- DERIVED STATE -------------------- */
  const selectedType = FILTER_TO_TYPE[selectedFilter];
  const selectedCategories = analytics.categories[selectedType] ?? [];
  const selectedTags = analytics.tags[selectedType] ?? [];

  const displayedCategories = showAllCategories
    ? selectedCategories
    : selectedCategories.slice(0, 5);
  const displayedTags = showAllTags ? selectedTags : selectedTags.slice(0, 5);

  const remainingCategoriesCount =
    selectedCategories.length > 5 ? selectedCategories.length - 5 : 0;
  const remainingTagsCount =
    selectedTags.length > 5 ? selectedTags.length - 5 : 0;

  const summaryAmount =
    selectedType === 'EXPENSE'
      ? analytics.expense
      : selectedType === 'INCOME'
      ? analytics.income
      : selectedType === 'INVESTMENTS'
      ? analytics.investments
      : analytics.savings;

  /* -------------------- FILTER PILLS -------------------- */
  const filters: Array<{ key: FilterType; color: string }> = [
    { key: 'Inc', color: COLORS.INCOME },
    { key: 'Exp', color: COLORS.EXPENSE },
    { key: 'Inv', color: COLORS.INVESTMENTS },
    { key: 'Sav', color: COLORS.SAVINGS },
  ];

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          <button onClick={() => router.push('/chat')}>
            <MessageCircle className="w-6 h-6" />
          </button>
          <button onClick={() => router.push('/dashboard')}>
            <Home className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 py-3 flex items-center gap-4">
        <SegmentToggle value={activeTab} onChange={setActiveTab} />
        <button
          ref={dateButtonRef}
          onClick={() => setIsDateModalOpen(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <Calendar className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium">{dateLabel}</span>
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white px-6 py-4 flex gap-3">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key)}
            className={`px-5 py-2 rounded-full font-medium border-2 ${
              selectedFilter === filter.key ? 'text-white' : 'text-slate-700'
            }`}
            style={{
              backgroundColor:
                selectedFilter === filter.key ? filter.color : 'white',
              borderColor: filter.color,
            }}
          >
            {filter.key}
          </button>
        ))}
      </div>

      {/* Categories or Tags */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{activeTab}</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border text-sm font-medium">
            Sort <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 flex justify-between text-lg font-bold capitalize">
          <span className="capitalize">
            {selectedType.toLocaleLowerCase()} Summary
          </span>
          <span>₹{summaryAmount.toLocaleString()}</span>
        </div>

        {/* Category or Tag Cards */}
        <div className="space-y-4">
          {activeTab === 'Categories' ? (
            <>
              {displayedCategories.map((cat) => (
                <CategoryRow
                  key={cat.name}
                  name={cat.name}
                  amount={cat.amount}
                  percentage={cat.percentage}
                  type={selectedType}
                />
              ))}
              {remainingCategoriesCount > 0 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full py-3 text-center text-slate-600 font-medium hover:text-slate-800 transition-colors"
                >
                  {showAllCategories ? (
                    'View less'
                  ) : (
                    <>
                      +{remainingCategoriesCount} more{' '}
                      <span className="ml-2 underline">View more</span>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <>
              {displayedTags.map((tag) => (
                <CategoryRow
                  key={tag.name}
                  name={tag.name}
                  amount={tag.amount}
                  percentage={tag.percentage}
                  type={selectedType}
                />
              ))}
              {remainingTagsCount > 0 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="w-full py-3 text-center text-slate-600 font-medium hover:text-slate-800 transition-colors"
                >
                  {showAllTags ? (
                    'View less'
                  ) : (
                    <>
                      +{remainingTagsCount} more{' '}
                      <span className="ml-2 underline">View more</span>
                    </>
                  )}
                </button>
              )}
              {displayedTags.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No tags found for this period
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Date Filter Modal */}
      <DateFilterModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateApply}
        currentStartDate={startDate}
        currentEndDate={endDate}
        anchorRef={dateButtonRef}
      />
    </div>
  );
}

/* -------------------- PAGE -------------------- */
export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <CategoriesContent />
    </ProtectedRoute>
  );
}
