import React from 'react';
import { LineChart } from '@mui/x-charts';
import { FlightSummaryData } from '@flight-monitor/shared';

interface PriceChartProps {
  flight: FlightSummaryData;
}

const PriceChart: React.FC<PriceChartProps> = ({ flight }) => {
  const timestamps = flight.priceHistory.map((_, index) => index + 1);
  const minPrice = Math.min(...flight.priceHistory);
  const maxPrice = Math.max(...flight.priceHistory);
  const priceRange = maxPrice - minPrice;
  const yAxisMin = Math.max(0, minPrice - priceRange * 0.1);
  const yAxisMax = maxPrice + priceRange * 0.1;

  return (
    <LineChart
      xAxis={[
        {
          data: timestamps,
          label: 'Updates',
          tickMinStep: 1,
        },
      ]}
      yAxis={[
        {
          label: 'Price ($)',
          min: yAxisMin,
          max: yAxisMax,
        },
      ]}
      series={[
        {
          data: flight.priceHistory,
          label: 'Price History',
          color: '#1976d2',
          area: true,
          showMark: true,
        },
      ]}
      height={300}
      margin={{ left: 70 }}
    />
  );
};

export default PriceChart;
