import { Alert, CreateAlertDto, AcknowledgeAlertDto } from '../types';
import { seedAlerts } from '../data/seed.data';

export class AlertRepository {
  private alerts: Map<string, Alert>;

  constructor() {
    this.alerts = new Map();
    this.initializeData();
  }

  private initializeData(): void {
    seedAlerts.forEach(alert => {
      this.alerts.set(alert.id, { ...alert });
    });
  }

  findAll(): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  findById(id: string): Alert | undefined {
    return this.alerts.get(id);
  }

  findByResourceId(resourceId: string): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.resourceId === resourceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  findUnacknowledged(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  create(dto: CreateAlertDto): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...dto,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  acknowledge(id: string, dto: AcknowledgeAlertDto): Alert | undefined {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updated: Alert = {
      ...alert,
      acknowledged: true,
      acknowledgedBy: dto.acknowledgedBy,
      acknowledgedAt: new Date(),
    };

    this.alerts.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.alerts.delete(id);
  }

  clearAcknowledged(): number {
    const acknowledged = Array.from(this.alerts.values())
      .filter(alert => alert.acknowledged);

    acknowledged.forEach(alert => this.alerts.delete(alert.id));
    return acknowledged.length;
  }
}
