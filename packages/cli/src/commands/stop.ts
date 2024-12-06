import ora from 'ora';
import chalk from 'chalk';
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function stopMonitor(id: string) {
  const spinner = ora('Stopping flight monitor...').start();

  try {
    const response = await fetch(`${API_URL}/monitor/${id}/stop`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error(await response.text());

    spinner.succeed(chalk.green('Monitor stopped successfully!'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    spinner.fail(chalk.red(`Failed to stop monitor: ${errorMessage}`));
    process.exit(1);
  }
}