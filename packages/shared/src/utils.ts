import { CabinClass } from './types/amadeus';

export function generateDateRange(
  baseDate: string,
  flexDays: number
): string[] {
  const dates = [];
  const base = new Date(baseDate);
  for (let i = -flexDays; i <= flexDays; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

export const POLL_INTERVALS = [
  { value: 300000, label: '5 minutes' },
  { value: 600000, label: '10 minutes' },
  { value: 1800000, label: '30 minutes' },
  { value: 3600000, label: '1 hour' },
];

export interface FlightSearchFormData {
  origin: string;
  destination: string;
  departDate: Date;
  returnDate: Date;
  departFlexDays: number;
  returnFlexDays: number;
  pollInterval: number;
  maxPrice?: number;
  preferredCabins?: CabinClass;
  adults?: number;
  children?: number;
  infants?: number;
  nonStop?: boolean;
  maxConnections?: number;
}

export interface FlightSummaryData {
  id: string;
  price: number;
  priceHistory: number[];
  timestamp: string;
  airline: string;
  outbound: {
    departure: string;
    arrival: string;
    duration: string;
    alternativeDate?: boolean;
  };
  return?: {
    departure: string;
    arrival: string;
    duration: string;
    alternativeDate?: boolean;
  };
}
export interface Credentials {
  clientId: string;
  clientSecret: string;
}
