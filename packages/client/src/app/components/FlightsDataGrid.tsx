import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { FlightSummaryData } from '@flight-monitor/shared';

interface FlightsDataGridProps {
  flights: FlightSummaryData[];
  onSelectFlight: (flight: FlightSummaryData) => void;
}

export default function FlightsDataGrid({
  flights,
  onSelectFlight,
}: FlightsDataGridProps) {
  const columns: GridColDef[] = [
    { field: 'airline', headerName: 'Airline', width: 130 },
    { field: 'id', headerName: 'Flight ID', width: 130 },
    {
      field: 'price',
      headerName: 'Current Price',
      width: 130,
      valueFormatter: (params) => `$${params.value}`,
      renderCell: (params) => {
        const flight = params.row as FlightSummaryData;
        const lastPrice = flight.priceHistory[flight.priceHistory.length - 1];
        const previousPrice =
          flight.priceHistory[flight.priceHistory.length - 2];
        const diff = lastPrice - previousPrice;
        const color = diff > 0 ? 'error' : diff < 0 ? 'success' : 'default';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            ${params.value}
            {flight.priceHistory.length > 1 && (
              <Typography color={color} variant="caption" sx={{ ml: 1 }}>
                ({diff > 0 ? '+' : ''}
                {diff.toFixed(2)})
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'lowestPrice',
      headerName: 'Lowest Price',
      width: 130,
      valueGetter: (params) =>
        Math.min(...(params.row as FlightSummaryData).priceHistory),
      valueFormatter: (params) => `$${params.value}`,
    },
    {
      field: 'outboundDeparture',
      headerName: 'Outbound Departure',
      width: 200,
      valueGetter: (params) => params.row.outbound.departure,
    },
    {
      field: 'returnDeparture',
      headerName: 'Return Departure',
      width: 200,
      valueGetter: (params) => params.row.return.departure,
    },
    {
      field: 'actions',
      headerName: 'Price History',
      width: 130,
      renderCell: (params) => (
        <Button
          startIcon={<TrendingUp />}
          onClick={() => onSelectFlight(params.row)}
        >
          View Chart
        </Button>
      ),
    },
  ];

  return (
    <DataGrid
      rows={flights}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: {
          sortModel: [{ field: 'price', sort: 'asc' }],
        },
      }}
      pageSizeOptions={[5, 10, 25]}
      checkboxSelection={false}
      disableRowSelectionOnClick
      autoHeight
      sx={{ mb: 4 }}
    />
  );
}
