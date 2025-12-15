// app/analysis/page.tsx
'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import {
  TrendingDown,
  TrendingUp,
  ChartCandlestick,
  PiggyBank,
  Loader2,
} from 'lucide-react';

const COLORS = {
  BACKGROUND: '#152D37',
  EXPENSE: '#E55F78',
  INCOME: '#74C4BB',
  INVESTMENTS: '#A3CDF3',
  SAVINGS: '#F6DB87',
};

interface TrendPoint {
  label: string;
  expense: number;
  income: number;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const height = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-24 bg-white/10 rounded-lg overflow-hidden">
      <div
        className="w-full absolute bottom-0 rounded-lg transition-all"
        style={{ height: `${Math.max(height, value > 0 ? 8 : 0)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function AnalysisContent() {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    fetchTrend();
  }, []);

  const fetchTrend = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/trend', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      if (res.ok) {
        const data = await res.json();
        setTrend(data.trend || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.BACKGROUND }}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const maxExpense = Math.max(...trend.map(t => t.expense), 1);
  const maxIncome = Math.max(...trend.map(t => t.income), 1);

  return (
    <div className="min-h-screen px-6 pb-24" style={{ backgroundColor: COLORS.BACKGROUND }}>
      <h1 className="text-white text-2xl font-bold pt-8">Analysis</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white/5 rounded-2xl p-4">
          <TrendingDown className="text-pink-400" />
          <p className="text-slate-400 text-sm mt-2">Expense Trend</p>
          <p className="text-white font-bold">Last 6 months</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4">
          <TrendingUp className="text-teal-400" />
          <p className="text-slate-400 text-sm mt-2">Income Trend</p>
          <p className="text-white font-bold">Last 6 months</p>
        </div>
      </div>

      {/* Expense Trend */}
      <div className="mt-8">
        <h2 className="text-white font-semibold mb-3">Expense over time</h2>
        <div className="grid grid-cols-6 gap-3">
          {trend.map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <MiniBar value={t.expense} max={maxExpense} color={COLORS.EXPENSE} />
              <span className="text-[10px] text-slate-400">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Income Trend */}
      <div className="mt-10">
        <h2 className="text-white font-semibold mb-3">Income over time</h2>
        <div className="grid grid-cols-6 gap-3">
          {trend.map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <MiniBar value={t.income} max={maxIncome} color={COLORS.INCOME} />
              <span className="text-[10px] text-slate-400">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-10 space-y-4">
        <div className="bg-white/5 rounded-2xl p-4">
          <ChartCandlestick className="text-blue-300" />
          <p className="text-white font-semibold mt-2">Spending Volatility</p>
          <p className="text-slate-400 text-sm">Your expenses fluctuate significantly month to month.</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <PiggyBank className="text-yellow-300" />
          <p className="text-white font-semibold mt-2">Savings Opportunity</p>
          <p className="text-slate-400 text-sm">You could save more by optimizing top categories.</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <ProtectedRoute>
      <AnalysisContent />
    </ProtectedRoute>
  );
}
