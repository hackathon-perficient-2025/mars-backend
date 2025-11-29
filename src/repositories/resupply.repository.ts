import type { ResupplyRequest, CreateResupplyRequestDto, UpdateResupplyRequestDto } from '../types';
import { ResupplyRequestModel } from '../models/resupply.model';

export class ResupplyRepository {
  async findAll(): Promise<ResupplyRequest[]> {
    const requests = await ResupplyRequestModel.find()
      .sort({ requestedAt: -1 })
      .lean();
    return requests.map(this.mapToResupplyRequest);
  }

  async findById(id: string): Promise<ResupplyRequest | null> {
    const request = await ResupplyRequestModel.findOne({ id }).lean();
    return request ? this.mapToResupplyRequest(request) : null;
  }

  async findByStatus(status: string): Promise<ResupplyRequest[]> {
    const requests = await ResupplyRequestModel.find({ status })
      .sort({ requestedAt: -1 })
      .lean();
    return requests.map(this.mapToResupplyRequest);
  }

  async findByResourceType(resourceType: string): Promise<ResupplyRequest[]> {
    const requests = await ResupplyRequestModel.find({ resourceType })
      .sort({ requestedAt: -1 })
      .lean();
    return requests.map(this.mapToResupplyRequest);
  }

  async create(dto: CreateResupplyRequestDto): Promise<ResupplyRequest> {
    const deliveryDays = dto.priority === 'urgent' ? 14 : dto.priority === 'high' ? 21 : 30;

    const request = new ResupplyRequestModel({
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...dto,
      status: 'pending',
      requestedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000),
    });

    const saved = await request.save();
    return this.mapToResupplyRequest(saved.toObject());
  }

  async update(id: string, dto: UpdateResupplyRequestDto): Promise<ResupplyRequest | null> {
    const request = await ResupplyRequestModel.findOne({ id });
    if (!request) return null;

    const updateData: any = { ...dto };

    if (dto.status === 'approved' && !request.approvedAt) {
      updateData.approvedAt = new Date();
    }

    if (dto.status === 'delivered' && !request.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    if (dto.status === 'cancelled' && !request.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const updated = await ResupplyRequestModel.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    ).lean();

    return updated ? this.mapToResupplyRequest(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ResupplyRequestModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  private mapToResupplyRequest(doc: any): ResupplyRequest {
    return {
      id: doc.id,
      resourceType: doc.resourceType,
      quantity: doc.quantity,
      priority: doc.priority,
      status: doc.status,
      requestedBy: doc.requestedBy,
      requestedAt: doc.requestedAt,
      notes: doc.notes,
      estimatedDelivery: doc.estimatedDelivery,
      approvedBy: doc.approvedBy,
      approvedAt: doc.approvedAt,
      deliveredAt: doc.deliveredAt,
      cancelledAt: doc.cancelledAt,
    };
  }
}
