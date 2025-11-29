import { AlertRepository } from '../repositories';
import { Alert, CreateAlertDto, AcknowledgeAlertDto } from '../types';

export class AlertService {
  constructor(private alertRepository: AlertRepository) {}

  getAllAlerts(): Alert[] {
    return this.alertRepository.findAll();
  }

  getAlertById(id: string): Alert {
    const alert = this.alertRepository.findById(id);
    if (!alert) {
      throw new Error(`Alert with id ${id} not found`);
    }
    return alert;
  }

  getAlertsByResourceId(resourceId: string): Alert[] {
    return this.alertRepository.findByResourceId(resourceId);
  }

  getUnacknowledgedAlerts(): Alert[] {
    return this.alertRepository.findUnacknowledged();
  }

  createAlert(dto: CreateAlertDto): Alert {
    const existingAlerts = this.alertRepository.findByResourceId(dto.resourceId);
    const hasUnacknowledged = existingAlerts.some(
      alert => !alert.acknowledged && alert.level === dto.level
    );

    if (hasUnacknowledged) {
      throw new Error(`Unacknowledged ${dto.level} alert already exists for this resource`);
    }

    return this.alertRepository.create(dto);
  }

  acknowledgeAlert(id: string, dto: AcknowledgeAlertDto): Alert {
    const acknowledged = this.alertRepository.acknowledge(id, dto);
    if (!acknowledged) {
      throw new Error(`Alert with id ${id} not found`);
    }
    return acknowledged;
  }

  deleteAlert(id: string): void {
    const deleted = this.alertRepository.delete(id);
    if (!deleted) {
      throw new Error(`Alert with id ${id} not found`);
    }
  }

  clearAcknowledgedAlerts(): number {
    return this.alertRepository.clearAcknowledged();
  }
}
