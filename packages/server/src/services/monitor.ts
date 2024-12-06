import { PrismaClient } from '@prisma/client';
import { AmadeusApi } from './amadeus';
import {
  AmadeusOffer,
  FlightOffer,
  Duration,
  CabinClass,
  FlightSearchFormData,
  Credentials,
  FlightSummaryData,
} from '@flight-monitor/shared';
import logger from '../utils/logger';

export class FlightMonitor {
  private monitors: Map<string, NodeJS.Timeout> = new Map();

  constructor(private amadeus: AmadeusApi, private prisma: PrismaClient) {
    logger.info('FlightMonitor service initialized');
  }

  private parseAmadeusOffer(
    amadeusOffer: AmadeusOffer,
    offer: FlightOffer,
    baseDepartDate: Date,
    baseReturnDate: Date
  ): FlightSummaryData {
    logger.debug('Parsing Amadeus offer', {
      offerId: offer.id,
      airline: offer.validatingAirlineCodes[0],
      baseDepartDate,
      baseReturnDate,
    });

    const departDate =
      offer.itineraries[0].segments[0].departure.at.split('T')[0];
    const returnDate =
      offer.itineraries[1]?.segments[0].departure.at.split('T')[0];

    return {
      id: offer.id,
      price: parseFloat(offer.price.total),
      priceHistory: [parseFloat(offer.price.total)],
      timestamp: new Date().toISOString(),
      airline:
        amadeusOffer.getCarrierInfo(offer.validatingAirlineCodes[0]) ||
        offer.validatingAirlineCodes[0],
      outbound: {
        departure: new Date(
          offer.itineraries[0].segments[0].departure.at
        ).toLocaleString(),
        arrival: new Date(
          offer.itineraries[0].segments[0].arrival.at
        ).toLocaleString(),
        duration: offer.itineraries[0].duration,
        alternativeDate: new Date(departDate) !== baseDepartDate,
      },
      return: offer.itineraries[1]
        ? {
            departure: new Date(
              offer.itineraries[1].segments[0].departure.at
            ).toLocaleString(),
            arrival: new Date(
              offer.itineraries[1].segments[0].arrival.at
            ).toLocaleString(),
            duration: offer.itineraries[1].duration,
            alternativeDate: new Date(returnDate) !== baseReturnDate,
          }
        : undefined,
    };
  }

  private createSearchParams(
    details: FlightSearchFormData,
    departDate: string,
    returnDate: string
  ): FlightSearchFormData {
    logger.debug('Creating search parameters', {
      origin: details.origin,
      destination: details.destination,
      departDate,
      returnDate,
    });

    return {
      origin: details.origin,
      destination: details.destination,
      departDate: new Date(departDate),
      returnDate: new Date(returnDate),
      departFlexDays: details.departFlexDays,
      returnFlexDays: details.returnFlexDays,
      pollInterval: details.pollInterval,
      maxPrice: details.maxPrice,
      preferredCabins: details.preferredCabins,
      adults: 1,
      nonStop: false,
    };
  }

  private formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise, parse and format
    return new Date(date).toISOString().split('T')[0];
  }

  async searchFlights(
    credentials: Credentials,
    details: FlightSearchFormData
  ): Promise<FlightSummaryData[]> {
    logger.info('Starting flight search', {
      details,
    });

    const departDates = this.generateDateRange(
      this.formatDate(details.departDate),
      details.departFlexDays
    );
    const returnDates = this.generateDateRange(
      this.formatDate(details.returnDate),
      details.returnFlexDays
    );

    let allFlights: FlightSummaryData[] = [];

    for (const departDate of departDates) {
      for (const returnDate of returnDates) {
        logger.debug('Searching date combination', { departDate, returnDate });
        const searchParams = this.createSearchParams(
          details,
          departDate,
          returnDate
        );

        try {
          const response = await this.amadeus.searchFlights(
            credentials,
            searchParams
          );
          const amadeusOffer = new AmadeusOffer(response);

          if (!amadeusOffer.isValid()) {
            logger.warn('Invalid Amadeus response received', {
              departDate,
              returnDate,
            });
            continue;
          }

          const filteredOffers = details.preferredCabins
            ? amadeusOffer
                .getData()
                .filter((offer) =>
                  offer.travelerPricings.some((pricing) =>
                    pricing.fareDetailsBySegment.some((fare) =>
                      details.preferredCabins?.includes(
                        fare.cabin as CabinClass
                      )
                    )
                  )
                )
            : amadeusOffer.getData();

          logger.debug('Flights found', {
            totalOffers: amadeusOffer.getData().length,
            filteredOffers: filteredOffers.length,
            departDate,
            returnDate,
          });

          const flights = filteredOffers.map((offer) =>
            this.parseAmadeusOffer(
              amadeusOffer,
              offer,
              details.departDate,
              details.returnDate
            )
          );

          allFlights.push(...flights);
        } catch (error) {
          logger.error('Search error occurred', {
            error: error instanceof Error ? error.message : 'Unknown error',
            departDate,
            returnDate,
            stack: error instanceof Error ? error.stack : undefined,
          });
          continue;
        }
      }
    }

    logger.info('Flight search completed', {
      totalFlightsFound: allFlights.length,
    });
    return allFlights;
  }

  private generateDateRange(base: string, flexDays: number): string[] {
    const dates: string[] = [];

    for (let i = -flexDays; i <= flexDays; i++) {
      const date = new Date(base);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  async startMonitoring(
    credentials: Credentials,
    details: FlightSearchFormData,
    monitorId: string
  ): Promise<void> {
    logger.info('Starting flight monitoring', {
      monitorId,
      details,
    });

    this.stopMonitoring(monitorId);

    try {
      const flights = await this.searchFlights(credentials, details);

      logger.debug('Initial flight search completed', {
        monitorId,
        flightsFound: flights.length,
      });

      await this.prisma.monitor.upsert({
        where: { id: monitorId },
        update: {
          credentials: JSON.stringify(credentials),
          details: JSON.stringify(details),
          flights: {
            deleteMany: {},
            createMany: {
              data: flights.map((flight) => ({
                amadeusId: flight.id,
                airline: flight.airline,
                price: flight.price,
                priceHistory: JSON.stringify([flight.price]),
                outbound: JSON.stringify(flight.outbound),
                return: flight.return ? JSON.stringify(flight.return) : null,
              })),
            },
          },
        },
        create: {
          id: monitorId,
          credentials: JSON.stringify(credentials),
          details: JSON.stringify(details),
          flights: {
            create: flights.map((flight) => ({
              amadeusId: flight.id,
              airline: flight.airline,
              price: flight.price,
              priceHistory: JSON.stringify([flight.price]),
              outbound: JSON.stringify(flight.outbound),
              return: flight.return ? JSON.stringify(flight.return) : null,
            })),
          },
        },
      });

      const interval = setInterval(async () => {
        try {
          logger.debug('Running monitoring interval', { monitorId });

          const newFlights = await this.searchFlights(credentials, details);

          for (const flight of newFlights) {
            const existingFlight = await this.prisma.flight.findUnique({
              where: { id: flight.id },
            });

            if (existingFlight) {
              const priceHistory = JSON.parse(existingFlight.priceHistory);
              const currentPrice = priceHistory[priceHistory.length - 1];

              if (flight.price !== currentPrice) {
                logger.info('Price change detected', {
                  monitorId,
                  flightId: flight.id,
                  oldPrice: currentPrice,
                  newPrice: flight.price,
                  priceDifference: flight.price - currentPrice,
                });
              }

              await this.prisma.flight.update({
                where: { id: flight.id },
                data: {
                  price: flight.price,
                  priceHistory: JSON.stringify([...priceHistory, flight.price]),
                  updatedAt: new Date(),
                },
              });
            }
          }
        } catch (error) {
          logger.error('Monitoring interval error', {
            monitorId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      }, details.pollInterval);

      this.monitors.set(monitorId, interval);
    } catch (error) {
      logger.error('Failed to start monitoring', {
        monitorId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  stopMonitoring(monitorId: string): void {
    logger.info('Stopping flight monitoring', { monitorId });

    const interval = this.monitors.get(monitorId);
    if (interval) {
      clearInterval(interval);
      this.monitors.delete(monitorId);
    }
  }

  async getFlights(monitorId: string): Promise<FlightSummaryData[]> {
    logger.debug('Retrieving flights', { monitorId });

    const flights = await this.prisma.flight.findMany({
      where: { monitorId },
    });

    return flights.map((flight) => ({
      id: flight.amadeusId,
      airline: flight.airline,
      price: flight.price,
      priceHistory: JSON.parse(flight.priceHistory),
      timestamp: flight.updatedAt.toISOString(),
      outbound: JSON.parse(flight.outbound),
      return: flight.return ? JSON.parse(flight.return) : undefined,
    }));
  }

  async getFlightHistory(flightId: string): Promise<number[]> {
    logger.debug('Retrieving flight history', { flightId });

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      logger.warn('Flight history not found', { flightId });
      return [];
    }

    return JSON.parse(flight.priceHistory);
  }
}
