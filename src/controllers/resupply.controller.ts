import type { Request, Response } from 'express';
import type { ResupplyService } from '../services';

export class ResupplyController {
  constructor(private resupplyService: ResupplyService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const requests = await this.resupplyService.getAllRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await this.resupplyService.getRequestById(req.params.id);
      res.json(request);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  getByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await this.resupplyService.getRequestsByStatus(req.params.status);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getByResourceType = async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await this.resupplyService.getRequestsByResourceType(req.params.type);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await this.resupplyService.createRequest(req.body);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await this.resupplyService.updateRequest(req.params.id, req.body);
      res.json(request);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  approve = async (req: Request, res: Response): Promise<void> => {
    try {
      const { approvedBy } = req.body;
      if (!approvedBy) {
        res.status(400).json({ error: 'approvedBy is required' });
        return;
      }
      const request = await this.resupplyService.approveRequest(req.params.id, approvedBy);
      res.json(request);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await this.resupplyService.cancelRequest(req.params.id);
      res.json(request);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.resupplyService.deleteRequest(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };
}
