import {
  AmadeusResponse,
  FlightSearchFormData,
  FlightSummaryData,
} from '@flight-monitor/shared';

export const getAccessToken = async (
  clientId: string,
  clientSecret: string
): Promise<string> => {
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

  if (!response.ok) throw new Error('Authentication failed');
  const data = await response.json();
  return data.access_token;
};

export const fetchFlights = async (
  accessToken: string,
  params: URLSearchParams
): Promise<AmadeusResponse> => {
  const response = await fetch(
    'https://test.api.amadeus.com/v2/shopping/flight-offers?' + params,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) throw new Error('Flight search failed');
  return response.json();
};

export const generateDateRange = (
  baseDate: string,
  flexDays: number
): string[] => {
  const dates = [];
  const base = new Date(baseDate);
  for (let i = -flexDays; i <= flexDays; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export const processFlightData = (
  data: AmadeusResponse,
  existingFlights: FlightSummaryData[] = [],
  baseDepartDate: string,
  baseReturnDate: string
): FlightSummaryData[] => {
  return data.data.map((offer) => {
    const existingFlight = existingFlights.find((f) => f.id === offer.id);
    const newPrice = parseFloat(offer.price.total);
    const departDate =
      offer.itineraries[0].segments[0].departure.at.split('T')[0];
    const returnDate =
      offer.itineraries[1]?.segments[0].departure.at.split('T')[0];

    return {
      id: offer.id,
      price: newPrice,
      priceHistory: existingFlight
        ? [...existingFlight.priceHistory, newPrice]
        : [newPrice],
      timestamp: new Date().toISOString(),
      airline: offer.validatingAirlineCodes[0],
      outbound: {
        departure: new Date(
          offer.itineraries[0].segments[0].departure.at
        ).toLocaleString(),
        arrival: new Date(
          offer.itineraries[0].segments[0].arrival.at
        ).toLocaleString(),
        duration: offer.itineraries[0].duration,
        alternativeDate: departDate !== baseDepartDate,
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
            alternativeDate: returnDate !== baseReturnDate,
          }
        : undefined,
    };
  });
};
