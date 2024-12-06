import { Request, Response } from 'express';
import { FlightMonitor } from '../services/monitor';
import {
  Credentials,
  FlightSearchFormData
} from '@flight-monitor/shared';
import logger from '../utils/logger';

interface ParamsWithId {
  id?: string;
}

interface StartMonitoringRequest {
  credentials: Credentials;
  details: FlightSearchFormData;
}

export class MonitorController {
  constructor(private monitor: FlightMonitor) {}

  startMonitoring = async (
    req: Request<ParamsWithId, any, StartMonitoringRequest>,
    res: Response
  ) => {
    const { credentials, details } = req.body;
    const monitorId = crypto.randomUUID();

    logger.debug('Received monitor start request', {
      origin: details.origin,
      destination: details.destination,
      monitorId
    });

    try {
      await this.monitor.startMonitoring(credentials, details, monitorId);
      res.json({ id: monitorId });
    } catch (error) {
      logger.error('Start monitoring error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to start monitoring',
      });
    }
  };

  stopMonitoring = async (req: Request<ParamsWithId>, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Monitor ID is required' });
    }

    logger.debug('Received monitor stop request', { monitorId: id });

    try {
      this.monitor.stopMonitoring(id);
      res.sendStatus(200);
    } catch (error) {
      logger.error('Stop monitoring error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        monitorId: id
      });
      res.status(500).json({ error: 'Failed to stop monitoring' });
    }
  };

  getFlights = async (req: Request<ParamsWithId>, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Monitor ID is required' });
    }

    logger.debug('Received get flights request', { monitorId: id });

    try {
      const flights = await this.monitor.getFlights(id);
      res.json(flights);
    } catch (error) {
      logger.error('Get flights error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        monitorId: id
      });
      res.status(500).json({ error: 'Failed to get flights' });
    }
  };

  getFlightHistory = async (
    req: Request<{ id?: string; flightId: string }>,
    res: Response
  ) => {
    const { id, flightId } = req.params;
    if (!id || !flightId) {
      return res.status(400).json({ error: 'Monitor ID and Flight ID are required' });
    }

    logger.debug('Received get flight history request', {
      monitorId: id,
      flightId
    });

    try {
      const history = await this.monitor.getFlightHistory(flightId);
      res.json(history);
    } catch (error) {
      logger.error('Get flight history error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        monitorId: id,
        flightId
      });
      res.status(500).json({ error: 'Failed to get flight history' });
    }
  };
}