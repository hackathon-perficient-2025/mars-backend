import { createServer } from 'http';
import { createApp } from './app';
import { config, validateConfig } from './config/env.config';
import { SocketHandler } from './socket/socket.handler';
import { ResourceService, AlertService } from './services';
import { ResourceRepository, AlertRepository } from './repositories';

validateConfig();

const app = createApp();
const httpServer = createServer(app);

const resourceRepository = new ResourceRepository();
const alertRepository = new AlertRepository();

const resourceService = new ResourceService(resourceRepository);
const alertService = new AlertService(alertRepository);

const socketHandler = new SocketHandler(
  httpServer,
  resourceService,
  alertService
);

socketHandler.startResourceUpdates(config.resourceUpdateInterval);
socketHandler.startAlertChecks(config.alertCheckInterval);

httpServer.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log('Mars Base Cargo Control - Backend API');
  console.log('='.repeat(50));
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Server running on port ${config.port}`);
  console.log(`API endpoint: http://localhost:${config.port}/api`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
  console.log(`Socket.IO: ws://localhost:${config.port}`);
  console.log(`CORS origin: ${config.corsOrigin}`);
  console.log('='.repeat(50));
});

const shutdown = (): void => {
  console.log('\nShutting down server...');
  socketHandler.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
