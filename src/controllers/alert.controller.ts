import { Request, Response } from 'express';
import { AlertService } from '../services';

export class AlertController {
  constructor(private alertService: AlertService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const alerts = this.alertService.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const alert = this.alertService.getAlertById(req.params.id);
      res.json(alert);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  getByResourceId = async (req: Request, res: Response): Promise<void> => {
    try {
      const alerts = this.alertService.getAlertsByResourceId(req.params.resourceId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getUnacknowledged = async (_req: Request, res: Response): Promise<void> => {
    try {
      const alerts = this.alertService.getUnacknowledgedAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const alert = this.alertService.createAlert(req.body);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  acknowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const alert = this.alertService.acknowledgeAlert(req.params.id, req.body);
      res.json(alert);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      this.alertService.deleteAlert(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  clearAcknowledged = async (_req: Request, res: Response): Promise<void> => {
    try {
      const count = this.alertService.clearAcknowledgedAlerts();
      res.json({ deleted: count });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
