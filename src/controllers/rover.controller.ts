import type { Request, Response } from 'express';
import type { RoverService } from '../services/rover.service';

export class RoverController {
    constructor(private roverService: RoverService) { }

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const rovers = await this.roverService.getAllRovers();
            res.json(rovers);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const rover = await this.roverService.getRoverById(req.params.id);
            res.json(rover);
        } catch (error) {
            res.status(404).json({ error: (error as Error).message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const rover = await this.roverService.createRover(req.body);
            res.status(201).json(rover);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const rover = await this.roverService.updateRover(req.params.id, req.body);
            res.json(rover);
        } catch (error) {
            res.status(404).json({ error: (error as Error).message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.roverService.deleteRover(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(404).json({ error: (error as Error).message });
        }
    };
}
