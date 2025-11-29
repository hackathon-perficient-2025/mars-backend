import { ResourceRepository } from '../repositories';
import { Resource, CreateResourceDto, UpdateResourceDto, ResourceHistory } from '../types';

export class ResourceService {
  constructor(private resourceRepository: ResourceRepository) {}

  getAllResources(): Resource[] {
    return this.resourceRepository.findAll();
  }

  getResourceById(id: string): Resource {
    const resource = this.resourceRepository.findById(id);
    if (!resource) {
      throw new Error(`Resource with id ${id} not found`);
    }
    return resource;
  }

  getResourceByType(type: string): Resource {
    const resource = this.resourceRepository.findByType(type);
    if (!resource) {
      throw new Error(`Resource with type ${type} not found`);
    }
    return resource;
  }

  createResource(dto: CreateResourceDto): Resource {
    return this.resourceRepository.create(dto);
  }

  updateResource(id: string, dto: UpdateResourceDto): Resource {
    const updated = this.resourceRepository.update(id, dto);
    if (!updated) {
      throw new Error(`Resource with id ${id} not found`);
    }
    return updated;
  }

  deleteResource(id: string): void {
    const deleted = this.resourceRepository.delete(id);
    if (!deleted) {
      throw new Error(`Resource with id ${id} not found`);
    }
  }

  getResourceHistory(resourceId: string, limit?: number): ResourceHistory[] {
    return this.resourceRepository.getHistory(resourceId, limit);
  }

  getResourceStatus(resource: Resource): 'critical' | 'warning' | 'normal' | 'optimal' {
    const percentage = (resource.currentLevel / resource.maxCapacity) * 100;

    if (percentage <= resource.criticalThreshold) return 'critical';
    if (percentage <= resource.warningThreshold) return 'warning';
    if (percentage >= 80) return 'optimal';
    return 'normal';
  }

  simulateConsumption(): void {
    const resources = this.resourceRepository.findAll();

    resources.forEach(resource => {
      const consumptionRate = resource.consumptionRate || 0;
      const randomVariation = (Math.random() - 0.5) * (consumptionRate * 0.2);
      const consumption = consumptionRate / 288 + randomVariation;

      const newLevel = Math.max(0, resource.currentLevel - consumption);

      this.resourceRepository.update(resource.id, {
        currentLevel: parseFloat(newLevel.toFixed(2)),
      });
    });
  }

  calculateTrend(resource: Resource): 'increasing' | 'decreasing' | 'stable' {
    const history = this.resourceRepository.getHistory(resource.id, 10);

    if (history.length < 2) return 'stable';

    const recent = history.slice(0, 5);
    const older = history.slice(5, 10);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, h) => sum + h.level, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.level, 0) / older.length;

    const diff = recentAvg - olderAvg;
    const threshold = resource.maxCapacity * 0.01;

    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  }
}
