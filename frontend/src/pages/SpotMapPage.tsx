import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSpots } from '../api/client';

// Fix Leaflet's default marker icon broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

export function SpotMapPage() {
  const { data: spots, isLoading, isError, refetch } = useQuery({
    queryKey: ['spots'],
    queryFn: getSpots,
    staleTime: 5 * 60 * 1000,
  });

  const activeSpots = spots?.filter((s) => s.active) ?? [];

  // Compute centre: average lat/lon of active spots, fall back to a sensible default
  const center: [number, number] =
    activeSpots.length > 0
      ? [
          activeSpots.reduce((sum, s) => sum + s.latitude, 0) / activeSpots.length,
          activeSpots.reduce((sum, s) => sum + s.longitude, 0) / activeSpots.length,
        ]
      : [64.5, -18]; // Iceland as a fallback

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 shrink-0">
        <h1 className="text-2xl font-bold text-sky-400 tracking-tight">Spot Map</h1>
        <p className="text-slate-400 text-sm mt-0.5">Active windsurfing spots</p>
      </header>

      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg z-10">
            Loading spots…
          </div>
        )}
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 z-10">
            Failed to load spots.{' '}
            <button onClick={() => refetch()} className="underline ml-1">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <MapContainer
            center={center}
            zoom={activeSpots.length > 0 ? 7 : 5}
            className="h-[calc(100vh-8rem)] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {activeSpots.map((spot) => (
              <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-base mb-1">{spot.name}</p>
                    <p className="text-gray-600 mb-2">
                      {spot.latitude.toFixed(4)}°N, {spot.longitude.toFixed(4)}°E
                      {spot.altitude > 0 && ` · ${spot.altitude} m`}
                    </p>
                    <Link
                      to={`/spots/${spot.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View forecast →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {!isLoading && !isError && activeSpots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No active spots.{' '}
            <Link to="/admin/spots" className="text-sky-400 underline ml-1">
              Add spots
            </Link>{' '}
            to see them on the map.
          </div>
        )}
      </div>
    </div>
  );
}
