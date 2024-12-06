import {
  AmadeusResponse,
  FlightOffer,
  Meta,
  Dictionaries,
  Location,
  Duration,
  PriceFormatOptions,
  AmadeusError,
  FlightAvailability,
  Connection,
  CabinClass,
} from '../types/amadeus';
import { FlightSearchFormData } from '../utils';

export class AmadeusOffer {
  private meta: Meta;
  private data: FlightOffer[];
  private dictionaries: Dictionaries;

  constructor(response: AmadeusResponse) {
    this.meta = response.meta;
    this.data = response.data;
    this.dictionaries = response.dictionaries;
  }

  // Getter methods
  public getMeta(): Meta {
    return this.meta;
  }

  public getData(): FlightOffer[] {
    return this.data;
  }

  public getDictionaries(): Dictionaries {
    return this.dictionaries;
  }

  // Utility methods
  public getFlightOfferById(id: string): FlightOffer | undefined {
    return this.data.find((offer) => offer.id === id);
  }

  public getAirportInfo(iataCode: string): Location | undefined {
    return this.dictionaries.locations[iataCode];
  }

  public getAircraftInfo(code: string): string | undefined {
    return this.dictionaries.aircraft[code];
  }

  public getCarrierInfo(code: string): string | undefined {
    return this.dictionaries.carriers[code];
  }

  public getCurrencyInfo(code: string): string | undefined {
    return this.dictionaries.currencies[code];
  }

  // Helper methods for common operations
  public getTotalPrice(offerId: string): string | undefined {
    const offer = this.getFlightOfferById(offerId);
    return offer?.price.total;
  }

  public getFlightDuration(offerId: string): Duration | undefined {
    const offer = this.getFlightOfferById(offerId);
    if (!offer?.itineraries[0]?.duration) return undefined;

    const duration = offer.itineraries[0].duration;
    // Parse PT9H10M format
    const hours = parseInt(duration.match(/(\d+)H/)?.[1] || '0');
    const minutes = parseInt(duration.match(/(\d+)M/)?.[1] || '0');

    return { hours, minutes };
  }

  public getSegmentCount(offerId: string): number {
    const offer = this.getFlightOfferById(offerId);
    return offer?.itineraries[0]?.segments.length ?? 0;
  }

  public getRouteDescription(offerId: string): string | undefined {
    const offer = this.getFlightOfferById(offerId);
    if (!offer?.itineraries[0]?.segments) return undefined;

    const segments = offer.itineraries[0].segments;
    const origin = segments[0].departure.iataCode;
    const destination = segments[segments.length - 1].arrival.iataCode;

    return `${origin} → ${destination}`;
  }

  // Data validation methods
  public isValid(): boolean {
    return (
      Array.isArray(this.data) &&
      this.data.length > 0 &&
      this.meta?.count === this.data.length &&
      !!this.dictionaries
    );
  }

  // Format methods
  public formatPrice(price: string, options: PriceFormatOptions = {}): string {
    const {
      currency = 'USD',
      locale = 'en-US',
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(Number(price));
  }

  public formatDateTime(
    dateTimeString: string,
    locale: string = 'en-US'
  ): string {
    return new Date(dateTimeString).toLocaleString(locale);
  }

  // Search and filter methods
  public findOffersByParams(params: FlightSearchFormData): FlightOffer[] {
    return this.data.filter((offer) => {
      const segments = offer.itineraries[0].segments;
      const origin = segments[0].departure.iataCode;
      const destination = segments[segments.length - 1].arrival.iataCode;
      const price = Number(offer.price.total);

      return (
        (!params.origin || origin === params.origin) &&
        (!params.destination || destination === params.destination) &&
        (!params.maxPrice || price <= params.maxPrice) &&
        (!params.nonStop || segments.length === 1) &&
        (!params.preferredCabins ||
          this.hasRequestedCabinClass(offer, params.preferredCabins))
      );
    });
  }

  private hasRequestedCabinClass(
    offer: FlightOffer,
    cabinClass: CabinClass
  ): boolean {
    return offer.travelerPricings.some((pricing) =>
      pricing.fareDetailsBySegment.some((fare) => fare.cabin === cabinClass)
    );
  }

  public getConnections(offerId: string): Connection[] {
    const offer = this.getFlightOfferById(offerId);
    if (!offer) return [];

    const segments = offer.itineraries[0].segments;
    const connections: Connection[] = [];

    for (let i = 0; i < segments.length - 1; i++) {
      connections.push({
        duration: this.calculateConnectionDuration(
          segments[i].arrival.at,
          segments[i + 1].departure.at
        ),
        origin: segments[i].arrival.iataCode,
        destination: segments[i + 1].departure.iataCode,
        departureTime: segments[i + 1].departure.at,
        arrivalTime: segments[i].arrival.at,
      });
    }

    return connections;
  }

  private calculateConnectionDuration(
    arrivalTime: string,
    departureTime: string
  ): string {
    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);
    const durationMs = departure.getTime() - arrival.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `PT${hours}H${minutes}M`;
  }

  // Serialization methods
  public toJSON(): string {
    return JSON.stringify({
      meta: this.meta,
      data: this.data,
      dictionaries: this.dictionaries,
    });
  }

  public static fromJSON(json: string): AmadeusOffer {
    const parsed = JSON.parse(json);
    return new AmadeusOffer(parsed);
  }

  // Additional validation method
  public validateOffer(offerId: string): AmadeusError[] {
    const errors: AmadeusError[] = [];
    const offer = this.getFlightOfferById(offerId);

    if (!offer) {
      errors.push({
        code: 'OFFER_NOT_FOUND',
        title: 'Offer not found',
        detail: `No offer found with ID ${offerId}`,
        status: 404,
      });
      return errors;
    }

    // Validate dates
    const now = new Date();
    const lastTicketingDate = new Date(offer.lastTicketingDate);
    if (lastTicketingDate < now) {
      errors.push({
        code: 'EXPIRED_OFFER',
        title: 'Offer expired',
        detail: 'The last ticketing date has passed',
        status: 400,
      });
    }

    // Validate availability
    if (offer.numberOfBookableSeats <= 0) {
      errors.push({
        code: 'NO_SEATS',
        title: 'No seats available',
        detail: 'No bookable seats remaining for this offer',
        status: 400,
      });
    }

    return errors;
  }

  // Get availability information
  public getAvailability(offerId: string): FlightAvailability {
    const offer = this.getFlightOfferById(offerId);
    if (!offer) {
      return {
        numberOfBookableSeats: 0,
        available: false,
      };
    }

    return {
      numberOfBookableSeats: offer.numberOfBookableSeats,
      available: offer.numberOfBookableSeats > 0,
    };
  }
}
