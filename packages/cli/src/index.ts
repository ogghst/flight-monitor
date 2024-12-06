#!/usr/bin/env node
import { Command } from 'commander';
import { startMonitor } from './commands/start.js';
import { stopMonitor } from './commands/stop.js';
import { getFlights } from './commands/flights.js';

const program = new Command();

program
  .name('flight-monitor')
  .description('CLI tool to monitor flight prices')
  .version('1.0.0');

program
  .command('start')
  .description('Start monitoring flight prices')
  .action(startMonitor);

program
  .command('stop')
  .description('Stop monitoring flight prices')
  .argument('<id>', 'Monitor ID')
  .action(stopMonitor);

program
  .command('flights')
  .description('Get monitored flights')
  .argument('<id>', 'Monitor ID')
  .action(getFlights);

await program.parseAsync();