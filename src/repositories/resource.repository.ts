import type { Resource, CreateResourceDto, UpdateResourceDto, ResourceHistory } from '../types';
import { ResourceModel } from '../models/resource.model';
import { ResourceHistoryModel } from '../models/resource-history.model';

export class ResourceRepository {
  async findAll(): Promise<Resource[]> {
    const resources = await ResourceModel.find().lean();
    return resources.map(this.mapToResource);
  }

  async findById(id: string): Promise<Resource | null> {
    const resource = await ResourceModel.findOne({ id }).lean();
    return resource ? this.mapToResource(resource) : null;
  }

  async findByType(type: string): Promise<Resource | null> {
    const resource = await ResourceModel.findOne({ type }).lean();
    return resource ? this.mapToResource(resource) : null;
  }

  async create(dto: CreateResourceDto): Promise<Resource> {
    const resource = new ResourceModel({
      id: `res-${dto.type}-${Date.now()}`,
      ...dto,
      lastUpdated: new Date(),
      trend: 'stable',
    });

    const saved = await resource.save();
    return this.mapToResource(saved.toObject());
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource | null> {
    const resource = await ResourceModel.findOneAndUpdate(
      { id },
      {
        ...dto,
        lastUpdated: new Date()
      },
      { new: true }
    ).lean();

    if (!resource) return null;

    if (dto.currentLevel !== undefined) {
      await this.addHistory({
        resourceId: id,
        timestamp: new Date(),
        level: dto.currentLevel,
      });
    }

    return this.mapToResource(resource);
  }

  async delete(id: string): Promise<boolean> {
    const result = await ResourceModel.deleteOne({ id });
    await ResourceHistoryModel.deleteMany({ resourceId: id });
    return result.deletedCount > 0;
  }

  async addHistory(entry: ResourceHistory): Promise<void> {
    await ResourceHistoryModel.create({
      resourceId: entry.resourceId,
      timestamp: entry.timestamp,
      level: entry.level,
    });

    const maxHistoryPerResource = 1000;
    const count = await ResourceHistoryModel.countDocuments({ resourceId: entry.resourceId });

    if (count > maxHistoryPerResource) {
      const entriesToDelete = await ResourceHistoryModel
        .find({ resourceId: entry.resourceId })
        .sort({ timestamp: 1 })
        .limit(count - maxHistoryPerResource)
        .select('_id');

      const idsToDelete = entriesToDelete.map(e => e._id);
      await ResourceHistoryModel.deleteMany({ _id: { $in: idsToDelete } });
    }
  }

  async getHistory(resourceId: string, limit?: number): Promise<ResourceHistory[]> {
    const query = ResourceHistoryModel.find({ resourceId })
      .sort({ timestamp: -1 });

    if (limit) {
      query.limit(limit);
    }

    const entries = await query.lean();
    return entries.map(entry => ({
      resourceId: entry.resourceId,
      timestamp: entry.timestamp,
      level: entry.level,
    }));
  }

  private mapToResource(doc: any): Resource {
    return {
      id: doc.id,
      type: doc.type,
      name: doc.name,
      currentLevel: doc.currentLevel,
      maxCapacity: doc.maxCapacity,
      unit: doc.unit,
      criticalThreshold: doc.criticalThreshold,
      warningThreshold: doc.warningThreshold,
      lastUpdated: doc.lastUpdated,
      trend: doc.trend,
      estimatedDaysRemaining: doc.estimatedDaysRemaining,
      consumptionRate: doc.consumptionRate,
    };
  }
}
