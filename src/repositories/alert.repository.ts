import type { Alert, CreateAlertDto, AcknowledgeAlertDto } from '../types';
import { AlertModel } from '../models/alert.model';

export class AlertRepository {
  async findAll(): Promise<Alert[]> {
    const alerts = await AlertModel.find()
      .sort({ timestamp: -1 })
      .lean();
    return alerts.map(this.mapToAlert);
  }

  async findById(id: string): Promise<Alert | null> {
    const alert = await AlertModel.findOne({ id }).lean();
    return alert ? this.mapToAlert(alert) : null;
  }

  async findByResourceId(resourceId: string): Promise<Alert[]> {
    const alerts = await AlertModel.find({ resourceId })
      .sort({ timestamp: -1 })
      .lean();
    return alerts.map(this.mapToAlert);
  }

  async findUnacknowledged(): Promise<Alert[]> {
    const alerts = await AlertModel.find({ acknowledged: false })
      .sort({ timestamp: -1 })
      .lean();
    return alerts.map(this.mapToAlert);
  }

  async create(dto: CreateAlertDto): Promise<Alert> {
    const alert = new AlertModel({
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...dto,
      timestamp: new Date(),
      acknowledged: false,
    });

    const saved = await alert.save();
    return this.mapToAlert(saved.toObject());
  }

  async acknowledge(id: string, dto: AcknowledgeAlertDto): Promise<Alert | null> {
    const alert = await AlertModel.findOneAndUpdate(
      { id },
      {
        acknowledged: true,
        acknowledgedBy: dto.acknowledgedBy,
        acknowledgedAt: new Date(),
      },
      { new: true }
    ).lean();

    return alert ? this.mapToAlert(alert) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AlertModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async clearAcknowledged(): Promise<number> {
    const result = await AlertModel.deleteMany({ acknowledged: true });
    return result.deletedCount;
  }

  private mapToAlert(doc: any): Alert {
    return {
      id: doc.id,
      resourceId: doc.resourceId,
      resourceName: doc.resourceName,
      level: doc.level,
      message: doc.message,
      timestamp: doc.timestamp,
      acknowledged: doc.acknowledged,
      acknowledgedBy: doc.acknowledgedBy,
      acknowledgedAt: doc.acknowledgedAt,
    };
  }
}
