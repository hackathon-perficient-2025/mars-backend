# Mars Base Cargo Control - Backend API

Professional Node.js/TypeScript backend for Mars Base resource monitoring and management system.

## Features

- **RESTful API** with Express.js
- **Real-time Updates** via Socket.IO
- **Interactive API Documentation** with Swagger/OpenAPI 3.0
- **TypeScript** for type safety
- **Layered Architecture** (Controllers, Services, Repositories)
- **In-memory Data Storage** with seed data
- **CORS Support** for frontend integration
- **Error Handling** middleware
- **Request Logging** middleware
- **Environment Configuration** with validation

## Architecture

### Layered Architecture (SOLID Principles)

```
┌─────────────────────────────────────┐
│         HTTP / WebSocket            │
├─────────────────────────────────────┤
│         Routes Layer                │
├─────────────────────────────────────┤
│      Controllers Layer              │
│   (Request/Response handling)       │
├─────────────────────────────────────┤
│       Services Layer                │
│     (Business Logic)                │
├─────────────────────────────────────┤
│     Repositories Layer              │
│    (Data Access Logic)              │
├─────────────────────────────────────┤
│      Data Storage                   │
│   (In-memory with seed data)        │
└─────────────────────────────────────┘
```

### Project Structure

```
src/
├── config/              # Configuration files
│   ├── env.config.ts
│   └── swagger.config.ts
├── controllers/         # Request handlers
│   ├── resource.controller.ts
│   ├── alert.controller.ts
│   └── resupply.controller.ts
├── data/                # Seed data
│   └── seed.data.ts
├── middleware/          # Express middleware
│   ├── error.middleware.ts
│   └── logger.middleware.ts
├── repositories/        # Data access layer
│   ├── resource.repository.ts
│   ├── alert.repository.ts
│   └── resupply.repository.ts
├── routes/              # API routes (with Swagger annotations)
│   ├── resource.routes.ts
│   ├── alert.routes.ts
│   ├── resupply.routes.ts
│   └── index.ts
├── services/            # Business logic
│   ├── resource.service.ts
│   ├── alert.service.ts
│   └── resupply.service.ts
├── socket/              # Socket.IO handlers
│   └── socket.handler.ts
├── types/               # TypeScript types
│   ├── resource.types.ts
│   ├── alert.types.ts
│   └── resupply.types.ts
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js v5
- **Real-time**: Socket.IO v4
- **API Documentation**: Swagger UI + swagger-jsdoc (OpenAPI 3.0)
- **CORS**: cors middleware
- **Environment**: dotenv
- **Development**: ts-node-dev

## Getting Started

### Prerequisites

- Node.js 18+ or higher
- npm or pnpm

### Installation

1. Navigate to the backend directory:
```bash
cd mars-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Documentation

### Interactive API Documentation (Swagger UI)

Access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

Features:
- Complete OpenAPI 3.0 specification
- Interactive API testing interface
- Detailed schema definitions for all entities
- Request/response examples
- Try-it-out functionality for all endpoints

### Base URL

```
http://localhost:3000/api
```

### Resources API

#### Get All Resources
```http
GET /api/resources
```

#### Get Resource by ID
```http
GET /api/resources/:id
```

#### Get Resource by Type
```http
GET /api/resources/type/:type
```

#### Create Resource
```http
POST /api/resources
Content-Type: application/json

{
  "type": "oxygen",
  "name": "Oxygen Supply",
  "currentLevel": 7200,
  "maxCapacity": 10000,
  "unit": "kg",
  "criticalThreshold": 20,
  "warningThreshold": 40
}
```

#### Update Resource
```http
PUT /api/resources/:id
Content-Type: application/json

{
  "currentLevel": 7000
}
```

#### Get Resource History
```http
GET /api/resources/:id/history?limit=100
```

### Alerts API

#### Get All Alerts
```http
GET /api/alerts
```

#### Get Unacknowledged Alerts
```http
GET /api/alerts/unacknowledged
```

#### Get Alerts by Resource ID
```http
GET /api/alerts/resource/:resourceId
```

#### Create Alert
```http
POST /api/alerts
Content-Type: application/json

{
  "resourceId": "res-oxygen-001",
  "resourceName": "Oxygen Supply",
  "level": "critical",
  "message": "Oxygen levels critical"
}
```

#### Acknowledge Alert
```http
PATCH /api/alerts/:id/acknowledge
Content-Type: application/json

{
  "acknowledgedBy": "Commander Sarah Chen"
}
```

#### Clear Acknowledged Alerts
```http
DELETE /api/alerts/acknowledged/clear
```

### Resupply API

#### Get All Requests
```http
GET /api/resupply
```

#### Get Requests by Status
```http
GET /api/resupply/status/:status
```

#### Get Requests by Resource Type
```http
GET /api/resupply/resource-type/:type
```

#### Create Resupply Request
```http
POST /api/resupply
Content-Type: application/json

{
  "resourceType": "oxygen",
  "quantity": 2000,
  "priority": "urgent",
  "requestedBy": "Commander Sarah Chen",
  "notes": "Emergency resupply needed"
}
```

#### Update Request
```http
PATCH /api/resupply/:id
Content-Type: application/json

{
  "status": "approved"
}
```

#### Approve Request
```http
PATCH /api/resupply/:id/approve
Content-Type: application/json

{
  "approvedBy": "Mission Control"
}
```

### Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T14:00:00.000Z",
  "uptime": 3600
}
```

## WebSocket Events

### Server to Client

- `resources:initial` - Initial resources data on connection
- `alerts:initial` - Initial alerts data on connection
- `resources:updated` - All resources updated
- `resource:updated` - Single resource updated
- `alert:created` - New alert created
- `alert:acknowledged` - Alert acknowledged
- `resupply:created` - New resupply request created
- `resupply:updated` - Resupply request updated

### Client to Server

- `resource:subscribe` - Subscribe to specific resource updates
- `resource:unsubscribe` - Unsubscribe from resource updates

### Example Usage

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('resources:updated', (resources) => {
  console.log('Resources updated:', resources);
});

socket.on('alert:created', (alert) => {
  console.log('New alert:', alert);
});

socket.emit('resource:subscribe', 'res-oxygen-001');
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Update intervals in milliseconds
RESOURCE_UPDATE_INTERVAL=5000
ALERT_CHECK_INTERVAL=10000
```

## Features in Detail

### Automatic Resource Consumption

The backend automatically simulates resource consumption every 5 seconds (configurable). Each resource decreases based on its consumption rate with slight random variations to simulate real-world conditions.

### Automatic Alert Generation

The system checks resource levels every 10 seconds (configurable) and automatically creates critical alerts when resources fall below their critical thresholds.

### Real-time Broadcasting

All changes to resources, alerts, and resupply requests are automatically broadcast to connected clients via Socket.IO.

## Design Patterns

### Repository Pattern
Data access logic is isolated in repository classes, making it easy to swap data sources (e.g., from in-memory to database).

### Service Layer Pattern
Business logic is separated from HTTP handling, enabling reuse and easier testing.

### Dependency Injection
Services receive their dependencies through constructors, following the Dependency Inversion Principle.

### Single Responsibility Principle
Each class has one reason to change:
- Controllers handle HTTP requests
- Services implement business logic
- Repositories manage data access

## Error Handling

All errors are caught and formatted consistently:

```json
{
  "error": {
    "message": "Resource with id xyz not found"
  }
}
```

In development mode, stack traces are included.

## Logging

All HTTP requests are logged with:
- Timestamp
- HTTP method
- URL
- Status code
- Response time

Example:
```
[2025-11-29T14:00:00.000Z] GET /api/resources 200 - 15ms
```

## Future Enhancements

- [ ] Add database support (MongoDB/PostgreSQL)
- [ ] Implement authentication/authorization
- [ ] Add input validation with Zod or Joi
- [ ] Add unit and integration tests
- [ ] Implement rate limiting
- [ ] Add data persistence
- [ ] Implement caching with Redis

## License

Copyright PERFICIENT - All rights reserved

## Acknowledgments

Built for Mars Base Operations - PERFICIENT Mission Control
