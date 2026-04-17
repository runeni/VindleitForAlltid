import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getOverview } from '../api/client';
import type { OverviewDay } from '../api/types';
import { HourRangePicker } from '../components/HourRangePicker';
import { WindArrow } from '../components/WindArrow';
import { getWindLevel, windLevelBg, windLevelBorder, formatDate } from '../utils/wind';

export function OverviewPage() {
  const [fromHour, setFromHour] = useState(8);
  const [toHour, setToHour] = useState(20);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['overview', fromHour, toHour],
    queryFn: () => getOverview(fromHour, toHour),
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const handleHourChange = (from: number, to: number) => {
    setFromHour(from);
    setToHour(to);
  };

  // Collect all unique dates across all spots
  const allDates: string[] = data
    ? [...new Set(data.flatMap((s) => s.days.map((d) => d.date)))].sort()
    : [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-sky-400 tracking-tight">
              Vindleit for alltid
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Windsurfing forecast overview</p>
          </div>
          <div className="flex items-center gap-4">
            <HourRangePicker fromHour={fromHour} toHour={toHour} onChange={handleHourChange} />
            <a
              href="/admin/spots"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Manage spots
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Legend */}
        <div className="flex items-center gap-3 mb-6 text-xs">
          <span className="text-slate-400">Wind strength:</span>
          {[
            { label: '< 5 m/s very light', cls: 'bg-slate-700 text-slate-300' },
            { label: '5–6 m/s light', cls: 'bg-sky-800 text-sky-100' },
            { label: '7–12 m/s good', cls: 'bg-green-800 text-green-100' },
            { label: '12–18 m/s strong', cls: 'bg-yellow-700 text-yellow-100' },
            { label: '> 18 m/s dangerous', cls: 'bg-red-800 text-red-100' },
          ].map(({ label, cls }) => (
            <span key={label} className={`${cls} px-2 py-0.5 rounded font-medium`}>
              {label}
            </span>
          ))}
        </div>

        {isLoading && (
          <div className="text-center text-slate-400 py-20 text-lg">Loading forecasts…</div>
        )}
        {isError && (
          <div className="text-center text-red-400 py-20">
            Failed to load forecasts.{' '}
            <button onClick={() => refetch()} className="underline">Retry</button>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-left">
                  <th className="px-4 py-3 font-semibold sticky left-0 bg-slate-800 z-10 min-w-[140px]">
                    Spot
                  </th>
                  {allDates.map((date) => (
                    <th key={date} className="px-3 py-3 font-semibold text-center min-w-[110px]">
                      {formatDate(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((overviewSpot, rowIdx) => (
                  <tr
                    key={overviewSpot.spot.id}
                    className={rowIdx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-850'}
                  >
                    {/* Spot name */}
                    <td className="px-4 py-2 sticky left-0 bg-inherit z-10">
                      <button
                        onClick={() => navigate(`/spots/${overviewSpot.spot.id}`)}
                        className="text-left font-medium text-slate-200 hover:text-sky-400 transition-colors"
                      >
                        {overviewSpot.spot.name}
                      </button>
                    </td>

                    {/* Day cells */}
                    {allDates.map((date) => {
                      const day: OverviewDay | undefined = overviewSpot.days.find(
                        (d) => d.date === date,
                      );
                      const speed = day?.bestWindSpeed ?? null;
                      const dir = day?.windFromDirection ?? null;
                      const level = getWindLevel(speed);
                      const bg = windLevelBg(level);
                      const border = windLevelBorder(level);

                      return (
                        <td key={date} className="px-2 py-1.5 text-center">
                          <button
                            onClick={() =>
                              navigate(
                                `/spots/${overviewSpot.spot.id}?fromHour=${fromHour}&toHour=${toHour}`,
                              )
                            }
                            className={`w-full rounded-lg px-2 py-2 border ${bg} ${border} transition-opacity hover:opacity-80 cursor-pointer`}
                          >
                            {speed != null ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-bold text-base leading-none">
                                  {speed.toFixed(1)}
                                </span>
                                <span className="text-xs opacity-70">m/s</span>
                                {dir != null && (
                                  <WindArrow degrees={dir} size={14} />
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.length === 0 && (
          <div className="text-center text-slate-400 py-20">
            No active spots. <a href="/admin/spots" className="text-sky-400 underline">Add spots</a> to get started.
          </div>
        )}
      </main>
    </div>
  );
}
