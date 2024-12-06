import { useRef, useEffect, useState } from 'react';
import {
  FlightSearchFormData,
  FlightSummaryData,
} from '@flight-monitor/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useFlightMonitor = (clientId: string, clientSecret: string) => {
  const [flights, setFlights] = useState<FlightSummaryData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const monitorId = useRef<string>();
  const pollTimer = useRef<number>();

  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
      }
    };
  }, []);

  const searchFlights = async (details: FlightSearchFormData) => {
    if (!clientId || !clientSecret) {
      setError('API credentials are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(
        JSON.stringify({
          credentials: { clientId, clientSecret },
          details,
        })
      );
      const response = await fetch(`${API_BASE_URL}/monitor/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials: { clientId, clientSecret },
          details,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { id } = await response.json();
      monitorId.current = id;

      const flightsResponse = await fetch(
        `${API_BASE_URL}/monitor/${id}/flights`
      );
      if (!flightsResponse.ok) {
        throw new Error(await flightsResponse.text());
      }

      const flightsData = await flightsResponse.json();
      setFlights(flightsData);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  const togglePolling = async (
    start: boolean,
    details: FlightSearchFormData
  ) => {
    if (start && !isPolling) {
      await searchFlights(details);

      pollTimer.current = window.setInterval(async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/monitor/${monitorId.current}/flights`
          );
          if (!response.ok) throw new Error(await response.text());

          const flightsData = await response.json();
          setFlights(flightsData);
          setLastUpdated(new Date().toLocaleString());
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, details.pollInterval);

      setIsPolling(true);
    } else {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
      }
      if (monitorId.current) {
        try {
          await fetch(`${API_BASE_URL}/monitor/${monitorId.current}/stop`, {
            method: 'POST',
          });
        } catch (error) {
          console.error('Error stopping monitor:', error);
        }
      }
      setIsPolling(false);
    }
  };

  return {
    flights,
    loading,
    error,
    isPolling,
    lastUpdated,
    searchFlights,
    togglePolling,
  };
};
