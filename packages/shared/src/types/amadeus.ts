// Base location interface
export interface Location {
  cityCode: string;
  countryCode: string;
}

// Flight equipment interface
export interface Aircraft {
  code: string;
}

// Fee structure
export interface Fee {
  amount: string;
  type: string;
}

// Price structure
export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: Fee[];
  grandTotal?: string;
}

// Pricing options
export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

// Baggage information
export interface IncludedCheckedBags {
  quantity: number;
}

// Fare segment details
export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  class: string;
  includedCheckedBags: IncludedCheckedBags;
}

// Traveler pricing information
export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

// Flight point (departure/arrival)
export interface FlightPoint {
  iataCode: string;
  at: string;
}

// Operating carrier
export interface Operating {
  carrierCode: string;
}

// Flight segment
export interface Segment {
  departure: FlightPoint;
  arrival: FlightPoint;
  carrierCode: string;
  number: string;
  aircraft: Aircraft;
  operating: Operating;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

// Flight itinerary
export interface Itinerary {
  duration: string;
  segments: Segment[];
}

// Dictionary structures
export interface Dictionaries {
  locations: { [key: string]: Location };
  aircraft: { [key: string]: string };
  currencies: { [key: string]: string };
  carriers: { [key: string]: string };
}

// Meta information
export interface Meta {
  count: number;
}

// Flight offer
export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

// Complete Amadeus response
export interface AmadeusResponse {
  meta: Meta;
  data: FlightOffer[];
  dictionaries: Dictionaries;
}

// Constants and enums
export enum CabinClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

export enum TravelerType {
  ADULT = 'ADULT',
  CHILD = 'CHILD',
  INFANT = 'INFANT',
}

export enum FareOption {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

// Utility types
export interface PriceFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface AmadeusError {
  code: string;
  title: string;
  detail: string;
  status: number;
}

/*
export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: CabinClass;
  maxPrice?: number;
  currencyCode?: string;
  nonStop?: boolean;
}
*/

export interface Duration {
  hours: number;
  minutes: number;
}

export interface Connection {
  duration: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

export interface BaggageAllowance {
  quantity: number;
  weight?: number;
  weightUnit?: 'KG' | 'LB';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'CM' | 'IN';
  };
}

export interface FlightAvailability {
  numberOfBookableSeats: number;
  available: boolean;
}
