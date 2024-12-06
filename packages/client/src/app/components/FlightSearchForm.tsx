import React, { FormEvent } from 'react';
import {
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import {
  Credentials,
  FlightSearchFormData,
  POLL_INTERVALS,
} from '@flight-monitor/shared';

interface FlightSearchFormProps {
  credentials: Credentials;
  flightDetails: FlightSearchFormData;
  loading: boolean;
  isPolling: boolean;
  hasResults: boolean;
  onCredentialsChange: (credentials: Credentials) => void;
  onFlightDetailsChange: (details: FlightSearchFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onTogglePolling: () => void;
}

export default function FlightSearchForm({
  credentials,
  flightDetails,
  loading,
  isPolling,
  hasResults,
  onCredentialsChange,
  onFlightDetailsChange,
  onSubmit,
  onTogglePolling,
}: FlightSearchFormProps) {
  const handleDateChange =
    (field: keyof Pick<FlightSearchFormData, 'departDate' | 'returnDate'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      if (field === 'departDate' && newDate > flightDetails.returnDate) {
        onFlightDetailsChange({
          ...flightDetails,
          departDate: newDate,
          returnDate: newDate,
        });
      } else if (field === 'returnDate' && newDate < flightDetails.departDate) {
        onFlightDetailsChange({
          ...flightDetails,
          departDate: newDate,
          returnDate: newDate,
        });
      } else {
        onFlightDetailsChange({
          ...flightDetails,
          [field]: newDate,
        });
      }
    };

  const handleFlexDaysChange =
    (
      field: keyof Pick<
        FlightSearchFormData,
        'departFlexDays' | 'returnFlexDays'
      >
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFlightDetailsChange({
        ...flightDetails,
        [field]: Math.min(3, Math.max(0, parseInt(e.target.value) || 0)),
      });
    };

  return (
    <Paper component="form" onSubmit={onSubmit} sx={{ p: 3, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Client ID"
            type="password"
            value={credentials.clientId}
            onChange={(e) =>
              onCredentialsChange({
                ...credentials,
                clientId: e.target.value,
              })
            }
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Client Secret"
            type="password"
            value={credentials.clientSecret}
            onChange={(e) =>
              onCredentialsChange({
                ...credentials,
                clientSecret: e.target.value,
              })
            }
            required
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label="Origin"
            value={flightDetails.origin}
            onChange={(e) =>
              onFlightDetailsChange({
                ...flightDetails,
                origin: e.target.value.toUpperCase(),
              })
            }
            inputProps={{ maxLength: 3 }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label="Destination"
            value={flightDetails.destination}
            onChange={(e) =>
              onFlightDetailsChange({
                ...flightDetails,
                destination: e.target.value.toUpperCase(),
              })
            }
            inputProps={{ maxLength: 3 }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="date"
            label="Departure Date"
            value={flightDetails.departDate}
            onChange={handleDateChange('departDate')}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Depart Flex Days"
            InputProps={{ inputProps: { min: 0, max: 3 } }}
            value={flightDetails.departFlexDays}
            onChange={handleFlexDaysChange('departFlexDays')}
            helperText="0-3 days"
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="date"
            label="Return Date"
            value={flightDetails.returnDate}
            onChange={handleDateChange('returnDate')}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Return Flex Days"
            InputProps={{ inputProps: { min: 0, max: 3 } }}
            value={flightDetails.returnFlexDays}
            onChange={handleFlexDaysChange('returnFlexDays')}
            helperText="0-3 days"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Poll Interval"
            value={flightDetails.pollInterval}
            onChange={(e) =>
              onFlightDetailsChange({
                ...flightDetails,
                pollInterval: Number(e.target.value),
              })
            }
          >
            {POLL_INTERVALS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} container spacing={2}>
          <Grid item xs>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search Flights'}
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              fullWidth
              variant="outlined"
              color={isPolling ? 'error' : 'success'}
              onClick={onTogglePolling}
              disabled={loading || (!isPolling && !hasResults)}
              startIcon={isPolling ? <Stop /> : <PlayArrow />}
              sx={{ mt: 2 }}
            >
              {isPolling ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
