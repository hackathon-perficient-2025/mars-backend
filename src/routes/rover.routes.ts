import { Router } from 'express';
import { RoverController } from '../controllers/rover.controller';

/**
 * @swagger
 * /rovers:
 *   get:
 *     summary: Get all rovers
 *     tags: [Rovers]
 *     responses:
 *       200:
 *         description: List of all rovers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rover'
 */

/**
 * @swagger
 * /rovers/{id}:
 *   get:
 *     summary: Get rover by ID
 *     tags: [Rovers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rover ID
 *     responses:
 *       200:
 *         description: Rover details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rover'
 *       404:
 *         description: Rover not found
 */

/**
 * @swagger
 * /rovers:
 *   post:
 *     summary: Create a new rover
 *     tags: [Rovers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoverDto'
 *     responses:
 *       201:
 *         description: Rover created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rover'
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /rovers/{id}:
 *   put:
 *     summary: Update rover
 *     tags: [Rovers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rover ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoverDto'
 *     responses:
 *       200:
 *         description: Rover updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rover'
 *       404:
 *         description: Rover not found
 *   patch:
 *     summary: Partially update rover
 *     tags: [Rovers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rover ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoverDto'
 *     responses:
 *       200:
 *         description: Rover updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rover'
 *       404:
 *         description: Rover not found
 *   delete:
 *     summary: Delete rover
 *     tags: [Rovers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rover ID
 *     responses:
 *       204:
 *         description: Rover deleted successfully
 *       404:
 *         description: Rover not found
 */

export function createRoverRoutes(controller: RoverController): Router {
    const router = Router();

    router.get('/', controller.getAll);
    router.get('/:id', controller.getById);
    router.post('/', controller.create);
    router.put('/:id', controller.update);
    router.patch('/:id', controller.update);
    router.delete('/:id', controller.delete);

    return router;
}
