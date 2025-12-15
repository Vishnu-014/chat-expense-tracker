'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import {
  Heart,
  Home,
  ChevronLeft,
  Edit2,
  Trash2,
  Star,
  Send,
  Loader2,
  LogOut,
  Utensils,
  Car,
  Bus,
  Bike,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Receipt,
  HeartPulse,
  Plane,
  Coffee,
  Shirt,
  Home as HomeIcon,
  Tv,
  GraduationCap,
  Gift,
  HandHeart,
  Smartphone,
  Dumbbell,
  Film,
  Music,
  PiggyBank,
  Briefcase,
  Lightbulb,
  Droplet,
  Zap,
  Wifi,
  Phone,
  TrendingDown,
  DollarSign,
  Check,
  ChevronDown,
  ChartCandlestick,
} from 'lucide-react';

type ChatMessage = {
  _id?: string;
  id: string;
  userId: string;
  inputText: string;
  parsedData: ParsedData | null;
  createdAt: string;
};

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
  BACKGROUND: '#152D37',
};

type TransactionFilter = 'EXPENSE' | 'INCOME' | 'INVESTMENTS' | 'SAVINGS';

const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();

  if (
    categoryLower.includes('food') ||
    categoryLower.includes('restaurant') ||
    categoryLower.includes('eating')
  )
    return Utensils;
  if (
    categoryLower.includes('transport') ||
    categoryLower.includes('taxi') ||
    categoryLower.includes('uber')
  )
    return Car;
  if (categoryLower.includes('bus')) return Bus;
  if (
    categoryLower.includes('bike') ||
    categoryLower.includes('cycle') ||
    categoryLower.includes('leisure')
  )
    return Bike;
  if (categoryLower.includes('shopping') || categoryLower.includes('retail'))
    return ShoppingBag;
  if (
    categoryLower.includes('salary') ||
    categoryLower.includes('income') ||
    categoryLower.includes('wage')
  )
    return Wallet;
  if (
    categoryLower.includes('investment') ||
    categoryLower.includes('stock') ||
    categoryLower.includes('mutual')
  )
    return ChartCandlestick;
  if (categoryLower.includes('bill') || categoryLower.includes('utility'))
    return Receipt;
  if (
    categoryLower.includes('health') ||
    categoryLower.includes('medical') ||
    categoryLower.includes('medicine')
  )
    return HeartPulse;
  if (
    categoryLower.includes('travel') ||
    categoryLower.includes('flight') ||
    categoryLower.includes('vacation')
  )
    return Plane;
  if (categoryLower.includes('coffee') || categoryLower.includes('cafe'))
    return Coffee;
  if (
    categoryLower.includes('clothing') ||
    categoryLower.includes('fashion') ||
    categoryLower.includes('apparel')
  )
    return Shirt;
  if (
    categoryLower.includes('rent') ||
    categoryLower.includes('housing') ||
    categoryLower.includes('mortgage')
  )
    return HomeIcon;
  if (
    categoryLower.includes('entertainment') ||
    categoryLower.includes('streaming') ||
    categoryLower.includes('subscription')
  )
    return Tv;
  if (
    categoryLower.includes('education') ||
    categoryLower.includes('course') ||
    categoryLower.includes('tuition')
  )
    return GraduationCap;
  if (categoryLower.includes('gift') || categoryLower.includes('donation'))
    return Gift;
  if (categoryLower.includes('charity') || categoryLower.includes('goodwill'))
    return HandHeart;
  if (
    categoryLower.includes('electronics') ||
    categoryLower.includes('gadget') ||
    categoryLower.includes('phone')
  )
    return Smartphone;
  if (
    categoryLower.includes('fitness') ||
    categoryLower.includes('gym') ||
    categoryLower.includes('sport')
  )
    return Dumbbell;
  if (categoryLower.includes('movie') || categoryLower.includes('cinema'))
    return Film;
  if (categoryLower.includes('music') || categoryLower.includes('concert'))
    return Music;
  if (categoryLower.includes('savings') || categoryLower.includes('deposit'))
    return PiggyBank;
  if (categoryLower.includes('freelance') || categoryLower.includes('business'))
    return Briefcase;
  if (categoryLower.includes('electricity') || categoryLower.includes('power'))
    return Zap;
  if (categoryLower.includes('water')) return Droplet;
  if (categoryLower.includes('internet') || categoryLower.includes('broadband'))
    return Wifi;
  if (categoryLower.includes('mobile') || categoryLower.includes('recharge'))
    return Phone;
  if (categoryLower.includes('refund') || categoryLower.includes('cashback'))
    return TrendingDown;

  return DollarSign; // Default icon
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'EXPENSE':
      return TrendingDown;
    case 'INCOME':
      return TrendingUp;
    case 'INVESTMENTS':
      return ChartCandlestick;
    case 'SAVINGS':
      return PiggyBank;
    default:
      return DollarSign;
  }
};

function ExpenseTrackerContent() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedFilter, setSelectedFilter] =
    useState<TransactionFilter>('EXPENSE');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchMessages();
    }
  }, [user, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!user || !token) return;

    try {
      setIsFetching(true);
      const response = await fetch(`/api/messages?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const totalBudget = 40000;
  const totalExpense = messages.reduce((sum, msg) => {
    if (msg.parsedData?.transaction_type === 'EXPENSE')
      return sum + msg.parsedData.amount;
    return sum;
  }, 0);
  const totalIncome = messages.reduce((sum, msg) => {
    if (msg.parsedData?.transaction_type === 'INCOME')
      return sum + msg.parsedData.amount;
    return sum;
  }, 0);
  const totalInvestment = messages.reduce((sum, msg) => {
    if (msg.parsedData?.transaction_type === 'INVESTMENTS')
      return sum + msg.parsedData.amount;
    return sum;
  }, 0);
  const totalSavings = 5000;

  const getCurrentTotal = () => {
    switch (selectedFilter) {
      case 'EXPENSE':
        return totalExpense;
      case 'INCOME':
        return totalIncome;
      case 'INVESTMENTS':
        return totalInvestment;
      case 'SAVINGS':
        return totalSavings;
    }
  };

  const expensePercent = (totalExpense / totalBudget) * 100;
  const incomePercent = (totalIncome / totalBudget) * 100;
  const investmentPercent = (totalInvestment / totalBudget) * 100;
  const savingsPercent = (totalSavings / totalBudget) * 100;

  const filterOptions = [
    {
      value: 'EXPENSE' as TransactionFilter,
      label: 'Expense',
      color: COLORS.EXPENSE,
    },
    {
      value: 'INCOME' as TransactionFilter,
      label: 'Income',
      color: COLORS.INCOME,
    },
    {
      value: 'INVESTMENTS' as TransactionFilter,
      label: 'Investments',
      color: COLORS.INVESTMENTS,
    },
    {
      value: 'SAVINGS' as TransactionFilter,
      label: 'Savings',
      color: COLORS.SAVINGS,
    },
  ];

  const handleSubmit = async () => {
    if (!input.trim() || !user || !token) return;

    const cleanInput = input.replace(/^#\s*/, '').trim();

    const tempId = `temp_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempId,
      userId: user.id,
      inputText: cleanInput,
      parsedData: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          inputText: cleanInput,
        }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? data.message : msg))
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save message');
      }
    } catch (error) {
      console.error('❌ Error saving message:', error);
      alert('Failed to save message. Check console for details.');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const removeTag = async (msgId: string, tagToRemove: string) => {
    if (!token) return;

    const message = messages.find((m) => m.id === msgId);
    if (!message?.parsedData) return;

    const updatedTags = message.parsedData.tags.filter(
      (tag) => tag !== tagToRemove
    );

    try {
      const response = await fetch(`/api/messages/${msgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          'parsedData.tags': updatedTags,
        }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setMessages(
          messages.map((msg) =>
            msg.id === msgId && msg.parsedData
              ? { ...msg, parsedData: { ...msg.parsedData, tags: updatedTags } }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== id));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return COLORS.EXPENSE;
      case 'INCOME':
        return COLORS.INCOME;
      case 'INVESTMENTS':
        return COLORS.INVESTMENTS;
      case 'SAVINGS':
        return COLORS.SAVINGS;
      default:
        return COLORS.EXPENSE;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  if (isFetching) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.BACKGROUND }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: COLORS.BACKGROUND }}
    >
      {/* Header */}
      <div
        className="pt-6 pb-4 px-6 flex-shrink-0"
        style={{ backgroundColor: COLORS.BACKGROUND }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">{user?.name}</span>
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center hover:bg-slate-700 transition"
            >
              <Home className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Budget Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Custom Dropdown */}
            <div className="relative mb-4">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-xl hover:bg-slate-700 transition"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: filterOptions.find(
                      (o) => o.value === selectedFilter
                    )?.color,
                  }}
                >
                  {selectedFilter === 'EXPENSE' && (
                    <TrendingDown className="w-4 h-4 text-white" />
                  )}
                  {selectedFilter === 'INCOME' && (
                    <TrendingUp className="w-4 h-4 text-white" />
                  )}
                  {selectedFilter === 'INVESTMENTS' && (
                    <ChartCandlestick className="w-4 h-4 text-white" />
                  )}
                  {selectedFilter === 'SAVINGS' && (
                    <PiggyBank className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-white font-medium">
                  {filterOptions.find((o) => o.value === selectedFilter)?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-20 min-w-[200px]">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: option.color }}
                        >
                          {option.value === 'EXPENSE' && (
                            <TrendingDown className="w-4 h-4 text-white" />
                          )}
                          {option.value === 'INCOME' && (
                            <TrendingUp className="w-4 h-4 text-white" />
                          )}
                          {option.value === 'INVESTMENTS' && (
                            <ChartCandlestick className="w-4 h-4 text-white" />
                          )}
                          {option.value === 'SAVINGS' && (
                            <PiggyBank className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-white">{option.label}</span>
                      </div>
                      {selectedFilter === option.value && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-end gap-8">
              <div>
                <div className="text-slate-400 text-sm mb-1">Budget</div>
                <div className="text-white text-2xl font-bold">
                  ₹{totalBudget.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Actual</div>
                <div className="text-white text-2xl font-bold">
                  ₹{getCurrentTotal().toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Ring Circular Progress */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="transform -rotate-90 w-20 h-20">
              {/* Expense Ring */}
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#334155"
                strokeWidth="4"
                fill="none"
                opacity={selectedFilter === 'EXPENSE' ? 1 : 0.3}
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke={COLORS.EXPENSE}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${expensePercent * 2.26} ${
                  226 - expensePercent * 2.26
                }`}
                strokeLinecap="round"
                opacity={selectedFilter === 'EXPENSE' ? 1 : 0.3}
              />

              {/* Income Ring */}
              <circle
                cx="40"
                cy="40"
                r="28"
                stroke="#334155"
                strokeWidth="4"
                fill="none"
                opacity={selectedFilter === 'INCOME' ? 1 : 0.3}
              />
              <circle
                cx="40"
                cy="40"
                r="28"
                stroke={COLORS.INCOME}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${incomePercent * 1.76} ${
                  176 - incomePercent * 1.76
                }`}
                strokeLinecap="round"
                opacity={selectedFilter === 'INCOME' ? 1 : 0.3}
              />

              {/* Investment Ring */}
              <circle
                cx="40"
                cy="40"
                r="20"
                stroke="#334155"
                strokeWidth="4"
                fill="none"
                opacity={selectedFilter === 'INVESTMENTS' ? 1 : 0.3}
              />
              <circle
                cx="40"
                cy="40"
                r="20"
                stroke={COLORS.INVESTMENTS}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${investmentPercent * 1.26} ${
                  126 - investmentPercent * 1.26
                }`}
                strokeLinecap="round"
                opacity={selectedFilter === 'INVESTMENTS' ? 1 : 0.3}
              />

              {/* Savings Ring */}
              <circle
                cx="40"
                cy="40"
                r="12"
                stroke="#334155"
                strokeWidth="4"
                fill="none"
                opacity={selectedFilter === 'SAVINGS' ? 1 : 0.3}
              />
              <circle
                cx="40"
                cy="40"
                r="12"
                stroke={COLORS.SAVINGS}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${savingsPercent * 0.75} ${
                  75 - savingsPercent * 0.75
                }`}
                strokeLinecap="round"
                opacity={selectedFilter === 'SAVINGS' ? 1 : 0.3}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {messages.map((message) => {
          const CategoryIcon = message.parsedData
            ? getCategoryIcon(message.parsedData.category)
            : DollarSign;
          const TypeIcon = message.parsedData
            ? getTypeIcon(message.parsedData.transaction_type)
            : DollarSign;

          return (
            <div key={message.id} className="space-y-3">
              <div className="flex justify-end">
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-3 shadow-lg"
                  style={{ backgroundColor: '#1e3a47' }}
                >
                  <div className="text-white text-sm leading-relaxed wrap-break-word">
                    #{message.inputText}
                  </div>
                </div>
              </div>

              {message.parsedData ? (
                <div className="flex justify-start">
                  <div
                    className="w-[400px] bg-white rounded-3xl shadow-xl p-5 border-l-4"
                    style={{
                      borderColor: getTypeColor(
                        message.parsedData.transaction_type
                      ),
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-slate-800 font-medium text-sm leading-relaxed flex items-center gap-1 flex-wrap">
                          {message.parsedData.text}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-[#5C5C5C] text-sm font-semibold">
                          {new Date(message.createdAt).toLocaleDateString(
                            'en-GB',
                            { day: '2-digit', month: 'short' }
                          )}
                        </div>
                        <div className="text-[#5C5C5C] text-sm font-semibold">
                          ₹{message.parsedData.amount.toLocaleString()}
                        </div>
                      </div>

                      <div
                        className="border-2 border-dashed rounded-xl p-3"
                        style={{
                          borderColor: getTypeColor(
                            message.parsedData.transaction_type
                          ),
                          backgroundColor: '#F9F5F7',
                        }}
                      >
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-[#5C5C5C] mb-1">Type</div>
                            <div className="flex items-center gap-1.5 text-[#5C5C5C] font-semibold capitalize">
                              <TypeIcon
                                className="w-3.5 h-3.5"
                                style={{
                                  color: getTypeColor(
                                    message.parsedData.transaction_type
                                  ),
                                }}
                              />
                              {message.parsedData.transaction_type}
                            </div>
                          </div>
                          <div>
                            <div className="text-[#5C5C5C] mb-1">Category</div>
                            <div className="flex items-center gap-1.5 text-[#5C5C5C] font-semibold">
                              <CategoryIcon className="w-3.5 h-3.5" />
                              {message.parsedData.category}
                            </div>
                          </div>
                        </div>
                      </div>

                      {message.parsedData.tags.length > 0 && (
                        <div>
                          <div className="text-[#5C5C5C] text-xs font-semibold mb-2">
                            Your tags
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {message.parsedData.tags.map((tag) => (
                              <div
                                key={tag}
                                className="inline-flex items-center gap-1.5 bg-slate-100 text-[#5C5C5C] px-2.5 py-1.5 rounded-full text-xs border border-slate-200"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(message.id, tag)}
                                  className="text-slate-400 hover:text-slate-600 text-sm"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs">
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {message.parsedData.sentiment !== undefined && (
                        <div className="flex items-center justify-between">
                          <div className="text-[#5C5C5C] text-xs font-semibold">
                            Sentiment
                          </div>
                          <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-200">
                            <span className="text-[#5C5C5C] text-xs">
                              {message.parsedData.sentiment.toFixed(2)}
                            </span>
                            <Heart
                              className="w-3.5 h-3.5 fill-red-500"
                              style={{ color: COLORS.EXPENSE }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                          <Star className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="w-[400px] bg-white rounded-3xl shadow-xl p-5 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-500 text-sm">
                      Analyzing...
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Bar */}
      <div
        className="px-6 py-4 border-t flex-shrink-0"
        style={{ backgroundColor: COLORS.BACKGROUND, borderColor: '#1e3a47' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-700/50 rounded-full px-4 py-3 flex items-center gap-2">
            <span className="text-slate-500 text-lg">#</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Lunch at restaurant 500"
              disabled={isLoading}
              className="bg-transparent text-white placeholder-slate-500 outline-none flex-1 disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="p-3 rounded-full hover:bg-opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: COLORS.EXPENSE }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ExpenseTrackerContent />
    </ProtectedRoute>
  );
}
