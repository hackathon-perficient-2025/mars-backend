import { Resource, CreateResourceDto, UpdateResourceDto, ResourceHistory } from '../types';
import { seedResources } from '../data/seed.data';

export class ResourceRepository {
  private resources: Map<string, Resource>;
  private history: ResourceHistory[];

  constructor() {
    this.resources = new Map();
    this.history = [];
    this.initializeData();
  }

  private initializeData(): void {
    seedResources.forEach(resource => {
      this.resources.set(resource.id, { ...resource });
    });
  }

  findAll(): Resource[] {
    return Array.from(this.resources.values());
  }

  findById(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  findByType(type: string): Resource | undefined {
    return Array.from(this.resources.values()).find(r => r.type === type);
  }

  create(dto: CreateResourceDto): Resource {
    const resource: Resource = {
      id: `res-${dto.type}-${Date.now()}`,
      ...dto,
      lastUpdated: new Date(),
      trend: 'stable',
    };

    this.resources.set(resource.id, resource);
    return resource;
  }

  update(id: string, dto: UpdateResourceDto): Resource | undefined {
    const resource = this.resources.get(id);
    if (!resource) return undefined;

    const updated: Resource = {
      ...resource,
      ...dto,
      lastUpdated: new Date(),
    };

    this.resources.set(id, updated);

    if (dto.currentLevel !== undefined) {
      this.addHistory({
        resourceId: id,
        timestamp: new Date(),
        level: dto.currentLevel,
      });
    }

    return updated;
  }

  delete(id: string): boolean {
    return this.resources.delete(id);
  }

  addHistory(entry: ResourceHistory): void {
    this.history.push(entry);

    const maxHistoryPerResource = 1000;
    const resourceHistory = this.history.filter(h => h.resourceId === entry.resourceId);

    if (resourceHistory.length > maxHistoryPerResource) {
      const toRemove = resourceHistory.length - maxHistoryPerResource;
      this.history = this.history.filter(
        h => h.resourceId !== entry.resourceId ||
        resourceHistory.indexOf(h) >= toRemove
      );
    }
  }

  getHistory(resourceId: string, limit?: number): ResourceHistory[] {
    const entries = this.history
      .filter(h => h.resourceId === resourceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? entries.slice(0, limit) : entries;
  }
}
