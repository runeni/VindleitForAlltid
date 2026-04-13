// API types matching the .NET backend DTOs

export interface Spot {
  id: number;
  identifier: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  active: boolean;
  sortOrder: number;
}

export interface ForecastEntry {
  spotId: number;
  spotName: string;
  time: string; // ISO 8601 UTC
  windSpeed: number;
  windGust: number | null;
  windFromDirection: number;
  symbolCode: string | null;
}

export interface OverviewDay {
  date: string; // "YYYY-MM-DD"
  bestWindSpeed: number | null;
  windFromDirection: number | null;
  windGust: number | null;
  symbolCode: string | null;
  hours: ForecastEntry[];
}

export interface OverviewSpot {
  spot: Spot;
  days: OverviewDay[];
}

export interface SpotForecast {
  spot: Spot;
  entries: ForecastEntry[];
}
