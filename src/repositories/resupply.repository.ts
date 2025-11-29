import { ResupplyRequest, CreateResupplyRequestDto, UpdateResupplyRequestDto } from '../types';
import { seedResupplyRequests } from '../data/seed.data';

export class ResupplyRepository {
  private requests: Map<string, ResupplyRequest>;

  constructor() {
    this.requests = new Map();
    this.initializeData();
  }

  private initializeData(): void {
    seedResupplyRequests.forEach(request => {
      this.requests.set(request.id, { ...request });
    });
  }

  findAll(): ResupplyRequest[] {
    return Array.from(this.requests.values())
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  findById(id: string): ResupplyRequest | undefined {
    return this.requests.get(id);
  }

  findByStatus(status: string): ResupplyRequest[] {
    return Array.from(this.requests.values())
      .filter(request => request.status === status)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  findByResourceType(resourceType: string): ResupplyRequest[] {
    return Array.from(this.requests.values())
      .filter(request => request.resourceType === resourceType)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  create(dto: CreateResupplyRequestDto): ResupplyRequest {
    const deliveryDays = dto.priority === 'urgent' ? 14 : dto.priority === 'high' ? 21 : 30;

    const request: ResupplyRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...dto,
      status: 'pending',
      requestedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000),
    };

    this.requests.set(request.id, request);
    return request;
  }

  update(id: string, dto: UpdateResupplyRequestDto): ResupplyRequest | undefined {
    const request = this.requests.get(id);
    if (!request) return undefined;

    const updated: ResupplyRequest = {
      ...request,
      ...dto,
    };

    if (dto.status === 'approved' && !request.approvedAt) {
      updated.approvedAt = new Date();
    }

    if (dto.status === 'delivered' && !request.deliveredAt) {
      updated.deliveredAt = new Date();
    }

    this.requests.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.requests.delete(id);
  }
}
