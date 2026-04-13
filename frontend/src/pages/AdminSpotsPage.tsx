import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSpots, createSpot, updateSpot, deleteSpot } from '../api/client';
import type { Spot } from '../api/types';
import { useNavigate } from 'react-router-dom';

interface SpotFormValues {
  identifier: string;
  name: string;
  latitude: string;
  longitude: string;
  altitude: string;
  sortOrder: string;
  active: boolean;
}

const emptyForm = (): SpotFormValues => ({
  identifier: '',
  name: '',
  latitude: '',
  longitude: '',
  altitude: '0',
  sortOrder: '0',
  active: true,
});

function spotToForm(s: Spot): SpotFormValues {
  return {
    identifier: s.identifier,
    name: s.name,
    latitude: String(s.latitude),
    longitude: String(s.longitude),
    altitude: String(s.altitude),
    sortOrder: String(s.sortOrder),
    active: s.active,
  };
}

export function AdminSpotsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SpotFormValues>(emptyForm());
  const [error, setError] = useState<string | null>(null);

  const { data: spots, isLoading } = useQuery({
    queryKey: ['spots'],
    queryFn: getSpots,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['spots'] });

  const createMutation = useMutation({
    mutationFn: (f: SpotFormValues) =>
      createSpot({
        identifier: f.identifier,
        name: f.name,
        latitude: Number(f.latitude),
        longitude: Number(f.longitude),
        altitude: Number(f.altitude),
        sortOrder: Number(f.sortOrder),
      }),
    onSuccess: () => { invalidate(); setShowForm(false); setForm(emptyForm()); setError(null); },
    onError: (e: Error) => setError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, f }: { id: number; f: SpotFormValues }) =>
      updateSpot(id, {
        identifier: f.identifier,
        name: f.name,
        latitude: Number(f.latitude),
        longitude: Number(f.longitude),
        altitude: Number(f.altitude),
        sortOrder: Number(f.sortOrder),
        active: f.active,
      }),
    onSuccess: () => { invalidate(); setEditingId(null); setForm(emptyForm()); setError(null); },
    onError: (e: Error) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSpot(id),
    onSuccess: invalidate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, f: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (spot: Spot) => {
    setEditingId(spot.id);
    setForm(spotToForm(spot));
    setShowForm(true);
    setError(null);
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm(emptyForm());
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-sky-400 text-sm"
            >
              ← Overview
            </button>
            <h1 className="text-xl font-bold text-sky-400">Manage Spots</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
            className="bg-sky-600 hover:bg-sky-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Add spot
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Inline form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-slate-200 font-semibold mb-4">
              {editingId !== null ? 'Edit spot' : 'New spot'}
            </h2>
            {error && (
              <div className="text-red-400 text-sm mb-4 bg-red-900/30 px-3 py-2 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {[
                { label: 'Identifier', key: 'identifier', type: 'text', disabled: editingId !== null },
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Latitude', key: 'latitude', type: 'number' },
                { label: 'Longitude', key: 'longitude', type: 'number' },
                { label: 'Altitude (m)', key: 'altitude', type: 'number' },
                { label: 'Sort order', key: 'sortOrder', type: 'number' },
              ].map(({ label, key, type, disabled }) => (
                <div key={key}>
                  <label className="block text-slate-400 text-xs mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof SpotFormValues] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    required
                    disabled={disabled}
                    step={type === 'number' ? 'any' : undefined}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>
              ))}

              {editingId !== null && (
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="accent-sky-500"
                  />
                  <label htmlFor="active" className="text-slate-300 text-sm">Active</label>
                </div>
              )}

              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg transition-colors"
                >
                  {editingId !== null ? 'Save changes' : 'Create spot'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Spots table */}
        {isLoading && (
          <div className="text-center text-slate-400 py-12">Loading spots…</div>
        )}

        {spots && spots.length > 0 && (
          <div className="rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Identifier</th>
                  <th className="px-4 py-3 font-medium">Lat / Lon</th>
                  <th className="px-4 py-3 font-medium">Alt</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {spots.map((spot, i) => (
                  <tr
                    key={spot.id}
                    className={`border-t border-slate-700/50 ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/40'}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">{spot.name}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{spot.identifier}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{spot.altitude}m</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          spot.active
                            ? 'bg-green-900/50 text-green-300 border border-green-800'
                            : 'bg-slate-700 text-slate-400 border border-slate-600'
                        }`}
                      >
                        {spot.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEdit(spot)}
                          className="text-sky-400 hover:text-sky-300 text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deactivate "${spot.name}"?`)) {
                              deleteMutation.mutate(spot.id);
                            }
                          }}
                          disabled={!spot.active}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors disabled:opacity-30"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
