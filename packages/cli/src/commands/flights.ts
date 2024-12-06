import ora from 'ora';
import chalk from 'chalk';
import { table } from 'table';
import fetch from 'node-fetch';
import type { Flight } from '@flight-monitor/shared';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function getFlights(id: string) {
  const spinner = ora('Fetching flights...').start();

  try {
    const response = await fetch(`${API_URL}/monitor/${id}/flights`);
    if (!response.ok) throw new Error(await response.text());

    const data = await response.json() as Flight[];
    spinner.stop();

    if (data.length === 0) {
      console.log(chalk.yellow('No flights found'));
      return;
    }

    // Prepare table data
    const tableData = [
      ['Airline', 'Price', 'Departure', 'Duration', 'Changes'],
    ];

    data.forEach(flight => {
      const priceChanges = flight.priceHistory.length > 1
        ? flight.price - flight.priceHistory[flight.priceHistory.length - 2]
        : 0;

      const priceChange = priceChanges === 0 
        ? '-' 
        : chalk[priceChanges > 0 ? 'red' : 'green'](`${priceChanges > 0 ? '+' : ''}${priceChanges.toFixed(2)}`);

      tableData.push([
        flight.airline,
        `$${flight.price}`,
        flight.outbound.departure,
        flight.outbound.duration,
        priceChange
      ]);
    });

    console.log(table(tableData));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    spinner.fail(chalk.red(`Failed to fetch flights: ${errorMessage}`));
    process.exit(1);
  }
}