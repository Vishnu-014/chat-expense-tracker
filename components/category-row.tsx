// components/CategoryRow.tsx
import { getCategoryIcon } from '@/lib/category-icons';
import { generatePastelColor } from '@/lib/pastel-color';

interface Props {
  name: string;
  amount: number;
  percentage: number;
  type: 'EXPENSE' | 'INCOME' | 'INVESTMENTS' | 'SAVINGS';
}

export function CategoryRow({
  name,
  amount,
  percentage,
}: Props) {
  const Icon = getCategoryIcon(name);
  const color = generatePastelColor(name);

  return (
    <div className="space-y-2">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-700" />
        <span className="font-semibold text-slate-800">
          {name}
        </span>
      </div>

      {/* Progress + Amount */}
      <div className="flex items-center gap-4">
        {/* Progress */}
        <div className="relative flex-1 h-8 rounded-full  overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full
                       flex items-center justify-end pr-3 transition-all"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          >
            <span className="text-xs font-semibold text-slate-800">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Amount */}
        <span className="min-w-[90px] text-right font-bold text-slate-900">
          ₹{amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
