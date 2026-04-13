import axios from 'axios';
import type { OverviewSpot, Spot, SpotForecast } from './types';

const api = axios.create({ baseURL: '/api' });

export async function getOverview(fromHour: number, toHour: number): Promise<OverviewSpot[]> {
  const { data } = await api.get<OverviewSpot[]>('/forecasts', {
    params: { fromHour, toHour },
  });
  return data;
}

export async function getSpotForecast(
  spotId: number,
  fromHour: number,
  toHour: number,
): Promise<SpotForecast> {
  const { data } = await api.get<SpotForecast>(`/forecasts/${spotId}`, {
    params: { fromHour, toHour },
  });
  return data;
}

export async function getSpots(): Promise<Spot[]> {
  const { data } = await api.get<Spot[]>('/spots');
  return data;
}

export async function createSpot(
  payload: Omit<Spot, 'id' | 'active'>,
): Promise<Spot> {
  const { data } = await api.post<Spot>('/spots', payload);
  return data;
}

export async function updateSpot(id: number, payload: Omit<Spot, 'id'>): Promise<Spot> {
  const { data } = await api.put<Spot>(`/spots/${id}`, payload);
  return data;
}

export async function deleteSpot(id: number): Promise<void> {
  await api.delete(`/spots/${id}`);
}
