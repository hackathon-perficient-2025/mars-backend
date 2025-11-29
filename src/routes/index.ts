import { Router } from 'express';
import { createResourceRoutes } from './resource.routes';
import { createAlertRoutes } from './alert.routes';
import { createResupplyRoutes } from './resupply.routes';
import { ResourceController, AlertController, ResupplyController } from '../controllers';

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */

export function createApiRoutes(
  resourceController: ResourceController,
  alertController: AlertController,
  resupplyController: ResupplyController
): Router {
  const router = Router();

  router.use('/resources', createResourceRoutes(resourceController));
  router.use('/alerts', createAlertRoutes(alertController));
  router.use('/resupply', createResupplyRoutes(resupplyController));

  router.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return router;
}
