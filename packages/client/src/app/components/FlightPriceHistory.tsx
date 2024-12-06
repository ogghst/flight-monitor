import React from 'react';
import { Box, Typography } from '@mui/material';
import { FlightSummaryData } from '@flight-monitor/shared';
import PriceChart from './PriceChart';

interface FlightPriceHistoryProps {
  flight: FlightSummaryData;
}

export default function FlightPriceHistory({
  flight,
}: FlightPriceHistoryProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Price History for {flight.airline}
      </Typography>
      <PriceChart flight={flight} />
    </Box>
  );
}
