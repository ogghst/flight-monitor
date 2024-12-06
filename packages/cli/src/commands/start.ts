import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { FlightDetails, POLL_INTERVALS } from '@flight-monitor/shared';

const API_URL = process.env.API_URL || 'http://localhost:3001';

interface StartResponse {
  id: string;
}

export async function startMonitor() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'clientId',
      message: 'Enter your Amadeus Client ID:',
      default: '88P6vLXrlCKmSz6EqjMqcVzDoMJ6jQKe',
      validate: (input) => input.length > 0,
    },
    {
      type: 'password',
      name: 'clientSecret',
      default: '6ZAYnAuAWgn9SLgI',
      message: 'Enter your Amadeus Client Secret:',
      validate: (input) => input.length > 0,
    },
    {
      type: 'input',
      name: 'origin',
      message: 'Enter origin airport code (e.g., VCE):',
      default: 'VCE',
      validate: (input) => /^[A-Z]{3}$/.test(input.toUpperCase()),
      filter: (input) => input.toUpperCase(),
    },
    {
      type: 'input',
      name: 'destination',
      message: 'Enter destination airport code (e.g., TFS):',
      default: 'TSF',
      validate: (input) => /^[A-Z]{3}$/.test(input.toUpperCase()),
      filter: (input) => input.toUpperCase(),
    },
    {
      type: 'input',
      name: 'departDate',
      message: 'Enter departure date (YYYY-MM-DD):',
      default: '2024-12-27',
      validate: (input) => /^\d{4}-\d{2}-\d{2}$/.test(input),
    },
    {
      type: 'input',
      name: 'returnDate',
      message: 'Enter return date (YYYY-MM-DD):',
      default: '2025-01-05',
      validate: (input) => /^\d{4}-\d{2}-\d{2}$/.test(input),
    },
    {
      type: 'number',
      name: 'departFlexDays',
      message: 'Enter departure flex days (0-3):',
      default: 2,
      validate: (input) => input >= 0 && input <= 3,
    },
    {
      type: 'number',
      name: 'returnFlexDays',
      message: 'Enter return flex days (0-3):',
      validate: (input) => input >= 0 && input <= 3,
      default: 2,
    },
    {
      type: 'list',
      name: 'pollInterval',
      message: 'Select polling interval:',
      default: POLL_INTERVALS[0].value,
      choices: POLL_INTERVALS.map((interval) => ({
        name: interval.label,
        value: interval.value,
      })),
    },
  ]);

  const { clientId, clientSecret, ...details } = answers;
  const spinner = ora('Starting flight monitor...').start();

  try {
    const response = await fetch(`${API_URL}/monitor/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentials: { clientId, clientSecret },
        details,
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = (await response.json()) as StartResponse;
    spinner.succeed(chalk.green(`Monitor started! ID: ${data.id}`));
    console.log(
      chalk.blue('\nUse this ID to check flights or stop monitoring:')
    );
    console.log(chalk.yellow(`  flight-monitor flights ${data.id}`));
    console.log(chalk.yellow(`  flight-monitor stop ${data.id}`));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    spinner.fail(chalk.red(`Failed to start monitor: ${errorMessage}`));
    process.exit(1);
  }
}
