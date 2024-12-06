import {
  AmadeusOffer,
  AmadeusResponse,
  Credentials,
  FlightSearchFormData,
} from '@flight-monitor/shared';
import logger from '../utils/logger';

export class AmadeusApi {
  private async getToken(
    clientId: string,
    clientSecret: string
  ): Promise<string> {
    try {
      const response = await fetch(
        'https://test.api.amadeus.com/v1/security/oauth2/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Authentication failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Token retrieval failed:', error);
      throw error;
    }
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
    params: FlightSearchFormData
  ): Promise<AmadeusResponse> {
    try {
      const token = await this.getToken(
        credentials.clientId,
        credentials.clientSecret
      );

      const requestBody = {
        currencyCode: 'EUR',
        originDestinations: [
          {
            id: '1',
            originLocationCode: params.origin.toUpperCase(),
            destinationLocationCode: params.destination.toUpperCase(),
            departureDateTimeRange: {
              date: this.formatDate(params.departDate),
              time: '10:00:00',
            },
          },
        ],
        travelers: [
          {
            id: '1',
            travelerType: 'ADULT',
            count: params.adults || 1,
          },
        ],
        sources: ['GDS'],
        searchCriteria: {
          maxFlightOffers: 200,
          flightFilters: {
            cabinRestrictions: [
              {
                cabin: 'ECONOMY',
                coverage: 'MOST_SEGMENTS',
                originDestinationIds: ['1'],
              },
            ],
            nonStop: params.nonStop,
          },
        },
      };

      // Add return flight if specified
      if (params.returnDate) {
        requestBody.originDestinations.push({
          id: '2',
          originLocationCode: params.destination.toUpperCase(),
          destinationLocationCode: params.origin.toUpperCase(),
          departureDateTimeRange: {
            date: this.formatDate(params.returnDate),
            time: '10:00:00',
          },
        });
      }

      logger.debug(
        'Searching flights with request:',
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(
        'https://test.api.amadeus.com/v2/shopping/flight-offers',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseText = await response.text();

      // Log response status and headers for debugging
      logger.debug('Response status:', response.status);
      logger.debug(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );
      logger.debug('Raw response:', responseText);

      if (!response.ok) {
        logger.error('Flight search failed:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          request: JSON.stringify(requestBody, null, 2),
        });
        throw new Error(`Flight search failed: ${response.statusText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        logger.error('Failed to parse response JSON:', e);
        throw new Error('Invalid response format from Amadeus API');
      }

      if (!responseData.data) {
        logger.error('Unexpected response structure:', responseData);
        throw new Error('Unexpected response structure from Amadeus API');
      }

      return responseData;
    } catch (error) {
      logger.error('Flight search operation failed:', error);
      throw error;
    }
  }
}
