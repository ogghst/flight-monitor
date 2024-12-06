import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { AmadeusApi } from './services/amadeus';
import { FlightMonitor } from './services/monitor';
import { MonitorController } from './controllers/monitor';
import {
  validateCredentials,
  validateFlightDetails,
} from './middleware/validation';

export function createApp() {
  const app = express();
  const prisma = new PrismaClient();
  const amadeus = new AmadeusApi();
  const monitor = new FlightMonitor(amadeus, prisma);
  const controller = new MonitorController(monitor);

  app.use(cors());
  app.use(express.json());

  app.post(
    '/monitor/start',
    validateCredentials,
    validateFlightDetails,
    controller.startMonitoring
  );

  app.post('/monitor/:id/stop', controller.stopMonitoring);
  app.get('/monitor/:id/flights', controller.getFlights);
  app.get(
    '/monitor/:id/flights/:flightId/history',
    controller.getFlightHistory
  );

  return { app, prisma };
}

export default createApp;
