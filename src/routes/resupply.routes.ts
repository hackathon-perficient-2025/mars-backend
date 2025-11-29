import { Router } from 'express';
import { ResupplyController } from '../controllers';

/**
 * @swagger
 * /resupply:
 *   get:
 *     summary: Get all resupply requests
 *     tags: [Resupply]
 *     responses:
 *       200:
 *         description: List of all resupply requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResupplyRequest'
 */

/**
 * @swagger
 * /resupply/status/{status}:
 *   get:
 *     summary: Get resupply requests by status
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, approved, in_transit, delivered, cancelled]
 *         description: Request status
 *     responses:
 *       200:
 *         description: List of resupply requests with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResupplyRequest'
 */

/**
 * @swagger
 * /resupply/resource-type/{type}:
 *   get:
 *     summary: Get resupply requests by resource type
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [oxygen, water, spare_parts, food, trees, solar_robots, energy_storage, medical_supplies, sewage_capacity, arable_land, pollinators, freshwater_aquifer, batteries, population]
 *         description: Resource type
 *     responses:
 *       200:
 *         description: List of resupply requests for the resource type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResupplyRequest'
 */

/**
 * @swagger
 * /resupply/{id}:
 *   get:
 *     summary: Get resupply request by ID
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Resupply request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResupplyRequest'
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /resupply:
 *   post:
 *     summary: Create a new resupply request
 *     tags: [Resupply]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResupplyRequestDto'
 *     responses:
 *       201:
 *         description: Resupply request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResupplyRequest'
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /resupply/{id}:
 *   put:
 *     summary: Update resupply request
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResupplyRequestDto'
 *     responses:
 *       200:
 *         description: Request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResupplyRequest'
 *       404:
 *         description: Request not found
 *   patch:
 *     summary: Partially update resupply request
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResupplyRequestDto'
 *     responses:
 *       200:
 *         description: Request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResupplyRequest'
 *       404:
 *         description: Request not found
 *   delete:
 *     summary: Delete resupply request
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       204:
 *         description: Request deleted successfully
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /resupply/{id}/approve:
 *   patch:
 *     summary: Approve a resupply request
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approvedBy
 *             properties:
 *               approvedBy:
 *                 type: string
 *                 example: Mission Control
 *     responses:
 *       200:
 *         description: Request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResupplyRequest'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /resupply/{id}/cancel:
 *   patch:
 *     summary: Cancel a resupply request
 *     tags: [Resupply]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResupplyRequest'
 *       404:
 *         description: Request not found
 */

export function createResupplyRoutes(controller: ResupplyController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/status/:status', controller.getByStatus);
  router.get('/resource-type/:type', controller.getByResourceType);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.patch('/:id', controller.update);
  router.patch('/:id/approve', controller.approve);
  router.patch('/:id/cancel', controller.cancel);
  router.delete('/:id', controller.delete);

  return router;
}
