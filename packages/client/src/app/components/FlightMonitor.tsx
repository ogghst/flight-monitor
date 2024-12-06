import React, { useState, FormEvent } from 'react';
import { Container, Typography, Paper, Alert, Box } from '@mui/material';
import {
  CabinClass,
  Credentials,
  FlightSearchFormData,
  FlightSummaryData,
} from '@flight-monitor/shared';
import { useFlightMonitor } from '../../lib/hooks';
import FlightPriceHistory from './FlightPriceHistory';
import FlightsDataGrid from './FlightsDataGrid';
import FlightSearchForm from './FlightSearchForm';
import FlightDetailsCard from './FlightDetailsCard';

export default function FlightMonitor() {
  const [credentials, setCredentials] = useState<Credentials>({
    clientId: '88P6vLXrlCKmSz6EqjMqcVzDoMJ6jQKe',
    clientSecret: '6ZAYnAuAWgn9SLgI',
  });

  const [flightDetails, setFlightDetails] = useState<FlightSearchFormData>({
    origin: 'LAX',
    destination: 'JFK',
    departDate: '2024-12-20',
    returnDate: '2024-12-27',
    departFlexDays: 0,
    returnFlexDays: 0,
    pollInterval: 300000,
    preferredCabins: CabinClass.ECONOMY,
  });

  const [selectedFlight, setSelectedFlight] =
    useState<FlightSummaryData | null>(null);

  const {
    flights,
    loading,
    error,
    isPolling,
    lastUpdated,
    searchFlights,
    togglePolling,
  } = useFlightMonitor(credentials.clientId, credentials.clientSecret);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await togglePolling(false, flightDetails);
    searchFlights(flightDetails);
  };

  const handleTogglePolling = async () => {
    await togglePolling(!isPolling, flightDetails);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Flight Price Monitor
      </Typography>

      <FlightSearchForm
        credentials={credentials}
        flightDetails={flightDetails}
        loading={loading}
        isPolling={isPolling}
        hasResults={flights.length > 0}
        onCredentialsChange={setCredentials}
        onFlightDetailsChange={setFlightDetails}
        onSubmit={handleSubmit}
        onTogglePolling={handleTogglePolling}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {flights.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2">
              Last updated: {lastUpdated}
            </Typography>
            {isPolling && (
              <Typography variant="subtitle2" color="primary">
                Monitoring active - Next update in:{' '}
                {Math.ceil(
                  (flightDetails.pollInterval -
                    (Date.now() - new Date(lastUpdated).getTime())) /
                    1000
                )}
                s
              </Typography>
            )}
          </Box>

          <FlightsDataGrid
            flights={flights}
            onSelectFlight={setSelectedFlight}
          />

          {selectedFlight && (
            <>
              <FlightPriceHistory flight={selectedFlight} />
              <FlightDetailsCard flight={selectedFlight} />
            </>
          )}
        </Paper>
      )}
    </Container>
  );
}
