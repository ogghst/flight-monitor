import { Request, Response, NextFunction } from 'express';
import { Credentials, FlightSearchFormData } from '@flight-monitor/shared';

type MonitorRequest = Request<
  {},
  {},
  { credentials: Credentials; details: FlightSearchFormData }
>;

export const validateCredentials = (
  req: MonitorRequest,
  res: Response,
  next: NextFunction
) => {
  const { clientId, clientSecret } = req.body.credentials;

  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Missing API credentials' });
  }

  next();
};

export const validateFlightDetails = (
  req: MonitorRequest,
  res: Response,
  next: NextFunction
) => {
  const { origin, destination, departDate, returnDate, pollInterval } =
    req.body.details;

  if (!origin || !destination || !departDate || !returnDate || !pollInterval) {
    return res.status(400).json({ error: 'Missing required flight details' });
  }

  // Validate airport codes
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return res.status(400).json({ error: 'Invalid airport code format' });
  }

  // Validate dates
  const depart = new Date(departDate);
  const return_ = new Date(returnDate);
  const now = new Date();

  if (isNaN(depart.getTime()) || isNaN(return_.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (depart < now) {
    return res
      .status(400)
      .json({ error: 'Departure date must be in the future' });
  }

  if (return_ <= depart) {
    return res
      .status(400)
      .json({ error: 'Return date must be after departure date' });
  }

  // Validate poll interval
  const validIntervals = [300000, 600000, 1800000, 3600000]; // 5min, 10min, 30min, 1h
  if (!validIntervals.includes(pollInterval)) {
    return res.status(400).json({ error: 'Invalid poll interval' });
  }

  next();
};
