'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import {
  Heart,
  Home,
  ChevronLeft,
  Edit2,
  Trash2,
  Star,
  Send,
  Loader2,
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
  transaction_type: 'EXPENSE' | 'INCOME' | 'INVESTMENTS';
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

export default function ExpenseTracker() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const userId = '693ec05052011935a81de4e9'; // Replace with actual user ID from auth

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      setIsFetching(true);
      // Save message and get parsed data
      const response = await fetch(`/api/messages?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
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

  const expensePercent = (totalExpense / totalBudget) * 100;
  const incomePercent = (totalIncome / totalBudget) * 100;
  const investmentPercent = (totalInvestment / totalBudget) * 100;
  const savingsPercent = (totalSavings / totalBudget) * 100;

  const handleSubmit = async () => {
    if (input.trim()) {
      const cleanInput = input.replace(/^#\s*/, '').trim();

      const tempId = `temp_${Date.now()}`;
      const userMessage: ChatMessage = {
        id: tempId,
        userId,
        inputText: cleanInput,
        parsedData: null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        console.log('🚀 Sending message to API:', {
          userId,
          inputText: cleanInput,
        });

        const token = localStorage.getItem('auth_token');

        // Save message and get parsed data
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            inputText: cleanInput,
          }),
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Message saved successfully:', data);
          // Update message with real ID and parsed data
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? data.message : msg))
          );
        } else {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          throw new Error(errorData.error || 'Failed to save message');
        }
      } catch (error) {
        console.error('❌ Error saving message:', error);
        alert('Failed to save message. Check console for details.');
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const removeTag = async (msgId: string, tagToRemove: string) => {
    const message = messages.find((m) => m.id === msgId);
    if (!message?.parsedData) return;

    const updatedTags = message.parsedData.tags.filter(
      (tag) => tag !== tagToRemove
    );

    try {
      const response = await fetch(`/api/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'parsedData.tags': updatedTags,
        }),
      });

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
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });

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
      default:
        return COLORS.EXPENSE;
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
          <button className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
            <Home className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Budget Section */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.EXPENSE }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                Expense
                <span className="text-slate-400 text-sm">$</span>
              </h2>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm">Budget</div>
              <div className="text-white text-2xl font-bold">
                ₹{totalBudget.toLocaleString()}
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-1 text-right mb-2">
              <div className="text-slate-400 text-sm">Actual</div>
              <div className="text-white text-2xl font-bold">
                ₹{totalExpense.toLocaleString()}
              </div>
            </div>
            {/* Multi-Ring Circular Progress */}
            <div className="relative w-20 h-20 ml-auto">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#334155"
                  strokeWidth="4"
                  fill="none"
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
                />
                <circle
                  cx="40"
                  cy="40"
                  r="28"
                  stroke="#334155"
                  strokeWidth="4"
                  fill="none"
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
                />
                <circle
                  cx="40"
                  cy="40"
                  r="20"
                  stroke="#334155"
                  strokeWidth="4"
                  fill="none"
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
                />
                <circle
                  cx="40"
                  cy="40"
                  r="12"
                  stroke="#334155"
                  strokeWidth="4"
                  fill="none"
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
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            {/* User Input - Right Side */}
            <div className="flex justify-end">
              <div
                className="max-w-[75%] rounded-2xl px-4 py-3 shadow-lg"
                style={{ backgroundColor: '#1e3a47' }}
              >
                <div className="text-white text-sm leading-relaxed break-words">
                  #{message.inputText}
                </div>
              </div>
            </div>

            {/* Parsed Data Card - Left Side */}
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
                        <Heart
                          className="inline-block w-4 h-4 fill-red-500"
                          style={{ color: COLORS.EXPENSE }}
                        />
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-slate-500 text-xs">
                        {new Date(message.createdAt).toLocaleDateString(
                          'en-GB',
                          { day: '2-digit', month: 'short' }
                        )}
                      </div>
                      <div className="text-slate-900 text-lg font-bold">
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
                          <div className="text-slate-400 mb-1">Type</div>
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getTypeColor(
                                  message.parsedData.transaction_type
                                ),
                              }}
                            />
                            {message.parsedData.transaction_type}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1">Category</div>
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="7" cy="17" r="3" strokeWidth={2} />
                              <circle cx="17" cy="17" r="3" strokeWidth={2} />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v8m0 0l3-3m-3 3L9 9"
                              />
                            </svg>
                            {message.parsedData.category}
                          </div>
                        </div>
                      </div>
                    </div>

                    {message.parsedData.tags.length > 0 && (
                      <div>
                        <div className="text-amber-600 text-xs font-medium mb-2">
                          Your tags
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {message.parsedData.tags.map((tag) => (
                            <div
                              key={tag}
                              className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-full text-xs border border-slate-200"
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
                        <div className="text-slate-500 text-xs">Sentiment</div>
                        <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-200">
                          <span className="text-slate-600 text-xs">
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
        ))}
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
