import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

export const createAnalyticsRoutes = (controller: AnalyticsController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/analytics/trends:
   *   get:
   *     summary: Get resource trend data with predictions
   *     tags: [Analytics]
   *     parameters:
   *       - in: query
   *         name: resourceId
   *         schema:
   *           type: string
   *         description: Filter by specific resource ID
   *       - in: query
   *         name: resourceType
   *         schema:
   *           type: string
   *           enum: [oxygen, water, spare_parts, food, trees, solar_robots, energy_storage, medical_supplies, sewage_capacity, arable_land, pollinators, freshwater_aquifer, batteries, population]
   *         description: Filter by resource type
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [24h, 7d, 30d, 90d]
   *           default: 7d
   *         description: Time range for analysis
   *       - in: query
   *         name: includePredictions
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include linear regression predictions
   *     responses:
   *       200:
   *         description: Trend data with optional predictions
   *       500:
   *         description: Server error
   */
  router.get('/trends', controller.getTrends);

  /**
   * @swagger
   * /api/analytics/stats:
   *   get:
   *     summary: Get aggregated statistics for resources
   *     tags: [Analytics]
   *     parameters:
   *       - in: query
   *         name: resourceId
   *         schema:
   *           type: string
   *         description: Filter by specific resource ID
   *       - in: query
   *         name: resourceType
   *         schema:
   *           type: string
   *         description: Filter by resource type
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [24h, 7d, 30d, 90d]
   *           default: 7d
   *         description: Time range for statistics
   *     responses:
   *       200:
   *         description: Aggregated statistics including min, max, average, median, std deviation
   *       500:
   *         description: Server error
   */
  router.get('/stats', controller.getStats);

  /**
   * @swagger
   * /api/analytics/anomalies/detect:
   *   get:
   *     summary: Detect anomalies in resource data (spikes, drops, leaks, unusual patterns)
   *     tags: [Analytics]
   *     parameters:
   *       - in: query
   *         name: resourceId
   *         schema:
   *           type: string
   *         description: Filter by specific resource ID
   *       - in: query
   *         name: resourceType
   *         schema:
   *           type: string
   *         description: Filter by resource type
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [24h, 7d, 30d, 90d]
   *           default: 7d
   *         description: Time range for anomaly detection
   *     responses:
   *       200:
   *         description: List of detected anomalies
   *       500:
   *         description: Server error
   */
  router.get('/anomalies/detect', controller.detectAnomalies);

  /**
   * @swagger
   * /api/analytics/anomalies:
   *   get:
   *     summary: Get previously detected anomalies
   *     tags: [Analytics]
   *     parameters:
   *       - in: query
   *         name: resourceId
   *         schema:
   *           type: string
   *         description: Filter by specific resource ID
   *       - in: query
   *         name: resourceType
   *         schema:
   *           type: string
   *         description: Filter by resource type
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [24h, 7d, 30d, 90d]
   *           default: 7d
   *         description: Time range for anomalies
   *     responses:
   *       200:
   *         description: List of anomalies
   *       500:
   *         description: Server error
   */
  router.get('/anomalies', controller.getAnomalies);

  return router;
};
