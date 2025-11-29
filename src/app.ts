import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.config';
import { swaggerSpec } from './config/swagger.config';
import { createApiRoutes } from './routes';
import { errorHandler, notFoundHandler, requestLogger } from './middleware';
import { ResourceController, AlertController, ResupplyController } from './controllers';
import { RoverController } from './controllers/rover.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ResourceService, AlertService, ResupplyService } from './services';
import { RoverService } from './services/rover.service';
import { AnalyticsService } from './services/analytics.service';
import { ResourceRepository, AlertRepository, ResupplyRepository } from './repositories';
import { RoverRepository } from './repositories/rover.repository';
import { AnalyticsRepository } from './repositories/analytics.repository';

export function createApp(): Application {
  const app = express();

  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Mars Base API Documentation',
  }));

  const resourceRepository = new ResourceRepository();
  const alertRepository = new AlertRepository();
  const resupplyRepository = new ResupplyRepository();
  const roverRepository = new RoverRepository();
  const analyticsRepository = new AnalyticsRepository();

  const resourceService = new ResourceService(resourceRepository);
  const alertService = new AlertService(alertRepository);
  const resupplyService = new ResupplyService(resupplyRepository);
  const roverService = new RoverService(roverRepository);
  const analyticsService = new AnalyticsService(analyticsRepository);

  const resourceController = new ResourceController(resourceService);
  const alertController = new AlertController(alertService);
  const resupplyController = new ResupplyController(resupplyService);
  const roverController = new RoverController(roverService);
  const analyticsController = new AnalyticsController(analyticsService);

  app.use('/api', createApiRoutes(
    resourceController,
    alertController,
    resupplyController,
    roverController,
    analyticsController
  ));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
