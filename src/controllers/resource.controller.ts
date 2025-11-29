import type { Request, Response } from 'express';
import type { ResourceService } from '../services';

export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const resources = await this.resourceService.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const resource = await this.resourceService.getResourceById(req.params.id);
      res.json(resource);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  getByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const resource = await this.resourceService.getResourceByType(req.params.type);
      res.json(resource);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const resource = await this.resourceService.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const resource = await this.resourceService.updateResource(req.params.id, req.body);
      res.json(resource);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.resourceService.deleteResource(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const history = await this.resourceService.getResourceHistory(req.params.id, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
