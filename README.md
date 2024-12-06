# Flight Monitor

A flight price monitoring system that tracks flight prices using the Amadeus API. Built with TypeScript, Node.js, and Next.js.

## Features

- Monitor flight prices in real-time
- Support for multiple flight searches
- Price history tracking
- Configurable monitoring intervals
- Cabin class filtering
- Flexible date ranges

## Project Structure

This is a monorepo containing the following packages:

- `packages/client`: Next.js frontend application
- `packages/server`: Node.js backend server
- `packages/shared`: Shared types and utilities
- `packages/cli`: Command-line interface tools

## Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- Amadeus API credentials

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/flight-monitor.git
cd flight-monitor
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
# In packages/server/.env
DATABASE_URL="file:./dev.db"
AMADEUS_CLIENT_ID="your_amadeus_client_id"
AMADEUS_CLIENT_SECRET="your_amadeus_client_secret"
```

4. Start the development servers:

```bash
npm run dev
```

## Development

- Backend server runs on http://localhost:3000
- Frontend client runs on http://localhost:8000
- Run tests: `npm test`
- Build: `npm run build`

## API Documentation

The server exposes the following endpoints:

### Monitor Endpoints

- `POST /api/monitors`: Create a new flight monitor
- `GET /api/monitors/:id`: Get monitor details
- `DELETE /api/monitors/:id`: Stop and delete a monitor

### Flight Endpoints

- `GET /api/flights/:monitorId`: Get flights for a monitor
- `GET /api/flights/:id/history`: Get price history for a flight

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built using the [Amadeus for Developers](https://developers.amadeus.com/) API
- Inspired by various flight price tracking tools
