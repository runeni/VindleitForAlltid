/**
 * Wind speed thresholds for windsurfing (m/s):
 *  < 7    → grey   (too light)
 *  7–12   → green  (good)
 *  12–18  → yellow (strong)
 *  > 18   → red    (too strong / dangerous)
 */

export type WindLevel = 'none' | 'light' | 'good' | 'strong' | 'dangerous';

export function getWindLevel(speed: number | null | undefined): WindLevel {
  if (speed == null) return 'none';
  if (speed < 7) return 'light';
  if (speed < 12) return 'good';
  if (speed < 18) return 'strong';
  return 'dangerous';
}

export function windLevelBg(level: WindLevel): string {
  switch (level) {
    case 'none':      return 'bg-slate-800 text-slate-500';
    case 'light':     return 'bg-slate-700 text-slate-300';
    case 'good':      return 'bg-green-800 text-green-100';
    case 'strong':    return 'bg-yellow-700 text-yellow-100';
    case 'dangerous': return 'bg-red-800 text-red-100';
  }
}

export function windLevelBorder(level: WindLevel): string {
  switch (level) {
    case 'none':      return 'border-slate-700';
    case 'light':     return 'border-slate-500';
    case 'good':      return 'border-green-600';
    case 'strong':    return 'border-yellow-500';
    case 'dangerous': return 'border-red-600';
  }
}

/** Format degrees as a compass direction abbreviation. */
export function degreesToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** Format a UTC ISO string to HH:mm in local time. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format a UTC ISO string to a short day label, e.g. "Mon 14. Apr". */
export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString([], {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}
