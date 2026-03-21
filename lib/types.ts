export type EventType =
  | "festival"
  | "custom"
  | "nature"
  | "cultural"
  | "religious"
  | "sport"
  | "market"
  | "royal"
  | "protest";

export type Region =
  | "London"
  | "South East"
  | "South West"
  | "East of England"
  | "East Midlands"
  | "West Midlands"
  | "Yorkshire"
  | "North West"
  | "North East"
  | "Scotland"
  | "Wales"
  | "Northern Ireland";

export interface UKEvent {
  id: string;
  name: string;
  type: EventType;
  month: number; // 1–12
  day?: number;
  endDay?: number;
  endMonth?: number;
  location: string;
  region: Region;
  lat: number;
  lng: number;
  popularity: 1 | 2 | 3 | 4 | 5;
  description: string;
  bestTime: string;
  photoTip: string; // kept in data but not displayed
  url?: string; // official or reference website
}

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  isLive: boolean;
  avgTemp?: number;
  avgDesc?: string;
}

export interface Preferences {
  regions: Region[];
  types: EventType[];
  minPopularity: number;
}
