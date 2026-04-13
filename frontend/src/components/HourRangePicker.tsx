interface HourRangePickerProps {
  fromHour: number;
  toHour: number;
  onChange: (from: number, to: number) => void;
}

export function HourRangePicker({ fromHour, toHour, onChange }: HourRangePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex items-center gap-4 bg-slate-800 rounded-lg px-4 py-3">
      <span className="text-slate-300 text-sm font-medium whitespace-nowrap">Session hours:</span>
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-xs">From</label>
        <select
          value={fromHour}
          onChange={(e) => onChange(Number(e.target.value), toHour)}
          className="bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm border border-slate-600 focus:outline-none focus:border-sky-500"
        >
          {hours.map((h) => (
            <option key={h} value={h} disabled={h >= toHour}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-xs">To</label>
        <select
          value={toHour}
          onChange={(e) => onChange(fromHour, Number(e.target.value))}
          className="bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm border border-slate-600 focus:outline-none focus:border-sky-500"
        >
          {hours.map((h) => (
            <option key={h} value={h} disabled={h <= fromHour}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
      <div className="text-slate-400 text-xs ml-2">
        ({toHour - fromHour}h window)
      </div>
    </div>
  );
}
