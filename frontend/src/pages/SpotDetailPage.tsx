import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSpotForecast } from '../api/client';
import { HourRangePicker } from '../components/HourRangePicker';
import { WindArrow } from '../components/WindArrow';
import { getWindLevel, windLevelBg, windLevelBorder, formatTime, formatDate } from '../utils/wind';

export function SpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fromHour, setFromHour] = useState(
    Number(searchParams.get('fromHour') ?? 8),
  );
  const [toHour, setToHour] = useState(
    Number(searchParams.get('toHour') ?? 20),
  );

  const spotId = Number(id);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['spot-forecast', spotId, fromHour, toHour],
    queryFn: () => getSpotForecast(spotId, fromHour, toHour),
    enabled: !isNaN(spotId),
    staleTime: 5 * 60 * 1000,
  });

  // Group entries by date
  const byDate: Record<string, NonNullable<typeof data>['entries']> = {};
  if (data) {
    for (const entry of data.entries) {
      const date = entry.time.slice(0, 10);
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(entry);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-sky-400 transition-colors text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-sky-400">
                {data?.spot.name ?? 'Loading…'}
              </h1>
              {data && (
                <p className="text-slate-500 text-xs mt-0.5">
                  {data.spot.latitude.toFixed(4)}°N {data.spot.longitude.toFixed(4)}°E
                  {' · '}alt. {data.spot.altitude}m
                </p>
              )}
            </div>
          </div>
          <HourRangePicker fromHour={fromHour} toHour={toHour} onChange={(f, t) => { setFromHour(f); setToHour(t); }} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="text-center text-slate-400 py-20">Loading forecast…</div>
        )}
        {isError && (
          <div className="text-center text-red-400 py-20">
            Failed to load forecast.{' '}
            <button onClick={() => refetch()} className="underline">Retry</button>
          </div>
        )}

        {data && Object.keys(byDate).length === 0 && (
          <div className="text-center text-slate-400 py-20">
            No forecast data available for this spot yet. The background job runs every hour.
          </div>
        )}

        {data &&
          Object.entries(byDate).map(([date, entries]) => (
            <section key={date} className="mb-8">
              <h2 className="text-slate-300 font-semibold mb-3 text-base">
                {formatDate(date)}
              </h2>
              <div className="rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-slate-400 text-left">
                      <th className="px-4 py-2 font-medium">Time</th>
                      <th className="px-4 py-2 font-medium">Wind</th>
                      <th className="px-4 py-2 font-medium">Gust</th>
                      <th className="px-4 py-2 font-medium">Direction</th>
                      <th className="px-4 py-2 font-medium">Symbol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => {
                      const level = getWindLevel(entry.windSpeed);
                      const bg = windLevelBg(level);
                      const border = windLevelBorder(level);
                      return (
                        <tr
                          key={entry.time}
                          className={`border-t border-slate-700/50 ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}`}
                        >
                          <td className="px-4 py-2.5 text-slate-300 font-mono">
                            {formatTime(entry.time)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${bg} ${border}`}>
                              {entry.windSpeed.toFixed(1)} m/s
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 text-xs">
                            {entry.windGust != null ? `${entry.windGust.toFixed(1)} m/s` : '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <WindArrow degrees={entry.windFromDirection} size={16} />
                              <span className="text-slate-400 text-xs">
                                {Math.round(entry.windFromDirection)}°
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs font-mono">
                            {entry.symbolCode ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
      </main>
    </div>
  );
}
