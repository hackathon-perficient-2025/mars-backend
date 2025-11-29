import type { AlertRepository } from '../repositories';
import type { Alert, CreateAlertDto, AcknowledgeAlertDto } from '../types';

export class AlertService {
  constructor(private alertRepository: AlertRepository) {}

  async getAllAlerts(): Promise<Alert[]> {
    return await this.alertRepository.findAll();
  }

  async getAlertById(id: string): Promise<Alert> {
    const alert = await this.alertRepository.findById(id);
    if (!alert) {
      throw new Error(`Alert with id ${id} not found`);
    }
    return alert;
  }

  async getAlertsByResourceId(resourceId: string): Promise<Alert[]> {
    return await this.alertRepository.findByResourceId(resourceId);
  }

  async getUnacknowledgedAlerts(): Promise<Alert[]> {
    return await this.alertRepository.findUnacknowledged();
  }

  async createAlert(dto: CreateAlertDto): Promise<Alert> {
    const existingAlerts = await this.alertRepository.findByResourceId(dto.resourceId);
    const hasUnacknowledged = existingAlerts.some(
      alert => !alert.acknowledged && alert.level === dto.level
    );

    if (hasUnacknowledged) {
      throw new Error(`Unacknowledged ${dto.level} alert already exists for this resource`);
    }

    return await this.alertRepository.create(dto);
  }

  async acknowledgeAlert(id: string, dto: AcknowledgeAlertDto): Promise<Alert> {
    const acknowledged = await this.alertRepository.acknowledge(id, dto);
    if (!acknowledged) {
      throw new Error(`Alert with id ${id} not found`);
    }
    return acknowledged;
  }

  async deleteAlert(id: string): Promise<void> {
    const deleted = await this.alertRepository.delete(id);
    if (!deleted) {
      throw new Error(`Alert with id ${id} not found`);
    }
  }

  async clearAcknowledgedAlerts(): Promise<number> {
    return await this.alertRepository.clearAcknowledged();
  }
}
