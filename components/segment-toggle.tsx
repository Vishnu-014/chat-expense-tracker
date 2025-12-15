// components/SegmentToggle.tsx
'use client';

type Segment = 'Categories' | 'Tags';

export function SegmentToggle({
  value,
  onChange,
}: {
  value: Segment;
  onChange: (v: Segment) => void;
}) {
  return (
    <div className="flex bg-slate-100 rounded-full p-1 w-fit">
      {(['Categories', 'Tags'] as Segment[]).map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300
            ${
              value === item
                ? 'bg-white shadow text-slate-900'
                : 'text-slate-500'
            }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
