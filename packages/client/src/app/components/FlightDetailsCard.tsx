import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { FlightSummaryData } from '@flight-monitor/shared';

interface FlightDetailsProps {
  flight: FlightSummaryData;
}

export default function FlightDetails({ flight }: FlightDetailsProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Flight Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Outbound Flight
            </Typography>
            <Typography>Departure: {flight.outbound.departure}</Typography>
            <Typography>Arrival: {flight.outbound.arrival}</Typography>
            <Typography>Duration: {flight.outbound.duration}</Typography>
            {flight.outbound.alternativeDate && (
              <Typography color="primary">Alternative Date Flight</Typography>
            )}
          </Box>
        </Grid>
        {flight.return && (
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Return Flight
              </Typography>
              <Typography>Departure: {flight.return.departure}</Typography>
              <Typography>Arrival: {flight.return.arrival}</Typography>
              <Typography>Duration: {flight.return.duration}</Typography>
              {flight.return.alternativeDate && (
                <Typography color="primary">Alternative Date Flight</Typography>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
