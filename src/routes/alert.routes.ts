import { Router } from 'express';
import { AlertController } from '../controllers';

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of all alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 */

/**
 * @swagger
 * /alerts/unacknowledged:
 *   get:
 *     summary: Get unacknowledged alerts
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of unacknowledged alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 */

/**
 * @swagger
 * /alerts/resource/{resourceId}:
 *   get:
 *     summary: Get alerts by resource ID
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: List of alerts for the resource
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 */

/**
 * @swagger
 * /alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Alert'
 *       404:
 *         description: Alert not found
 */

/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlertDto'
 *     responses:
 *       201:
 *         description: Alert created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Alert'
 *       400:
 *         description: Invalid request or duplicate alert
 */

/**
 * @swagger
 * /alerts/{id}/acknowledge:
 *   patch:
 *     summary: Acknowledge an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcknowledgeAlertDto'
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Alert'
 *       404:
 *         description: Alert not found
 */

/**
 * @swagger
 * /alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       204:
 *         description: Alert deleted successfully
 *       404:
 *         description: Alert not found
 */

/**
 * @swagger
 * /alerts/acknowledged/clear:
 *   delete:
 *     summary: Clear all acknowledged alerts
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: Acknowledged alerts cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: number
 *                   description: Number of alerts deleted
 */

export function createAlertRoutes(controller: AlertController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/unacknowledged', controller.getUnacknowledged);
  router.get('/resource/:resourceId', controller.getByResourceId);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.patch('/:id/acknowledge', controller.acknowledge);
  router.delete('/:id', controller.delete);
  router.delete('/acknowledged/clear', controller.clearAcknowledged);

  return router;
}
