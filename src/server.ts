import { createServer } from "http";
import { createApp } from "./app";
import { config, validateConfig } from "./config/env.config";
import { database } from "./config/database.config";
import { seedService } from "./data/seed.service";
import { SocketHandler } from "./socket/socket.handler";
import { ResourceService, AlertService } from "./services";
import { RoverService } from "./services/rover.service";
import { AnalyticsService } from "./services/analytics.service";
import { ResourceRepository, AlertRepository } from "./repositories";
import { RoverRepository } from "./repositories/rover.repository";
import { AnalyticsRepository } from "./repositories/analytics.repository";

// Initialize app for Vercel serverless
let isConnected = false;

async function initializeDatabase() {
  if (!isConnected) {
    validateConfig();
    await database.connect();
    await seedService.seedDatabase();
    isConnected = true;
  }
}

// Export for Vercel serverless
const app = createApp();

export default async (req: any, res: any) => {
  await initializeDatabase();
  return app(req, res);
};

async function startServer(): Promise<void> {
  try {
    validateConfig();

    await database.connect();

    await seedService.seedDatabase();

    const httpServer = createServer(app);

    const resourceRepository = new ResourceRepository();
    const alertRepository = new AlertRepository();
    const roverRepository = new RoverRepository();
    const analyticsRepository = new AnalyticsRepository();

    const resourceService = new ResourceService(resourceRepository);
    const alertService = new AlertService(alertRepository);
    const roverService = new RoverService(roverRepository);
    const analyticsService = new AnalyticsService(analyticsRepository);

    const socketHandler = new SocketHandler(
      httpServer,
      resourceService,
      alertService,
      roverService,
      analyticsService
    );

    socketHandler.startResourceUpdates(config.resourceUpdateInterval);
    socketHandler.startAlertChecks(config.alertCheckInterval);
    socketHandler.startRoverUpdates(3000); // 3 second intervals for rovers
    socketHandler.startMetricsCollection(300000); // Collect metrics every 5 minutes

    httpServer.listen(config.port, () => {
      console.log("=".repeat(50));
      console.log("Mars Base Cargo Control - Backend API");
      console.log("=".repeat(50));
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`MongoDB: ${config.mongoUri}`);
      console.log(`Server running on port ${config.port}`);
      console.log(`API endpoint: http://localhost:${config.port}/api`);
      console.log(`API docs: http://localhost:${config.port}/api-docs`);
      console.log(`Health check: http://localhost:${config.port}/api/health`);
      console.log(`Socket.IO: ws://localhost:${config.port}`);
      console.log(`CORS origin: ${config.corsOrigin}`);
      console.log("=".repeat(50));
    });

    const shutdown = async (): Promise<void> => {
      console.log("\nShutting down server...");
      socketHandler.stop();
      httpServer.close(async () => {
        await database.disconnect();
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== "1" && require.main === module) {
  startServer();
}
