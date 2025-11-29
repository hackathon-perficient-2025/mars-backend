import type { ResupplyRepository } from '../repositories';
import type { ResupplyRequest, CreateResupplyRequestDto, UpdateResupplyRequestDto } from '../types';

export class ResupplyService {
  constructor(private resupplyRepository: ResupplyRepository) {}

  async getAllRequests(): Promise<ResupplyRequest[]> {
    return await this.resupplyRepository.findAll();
  }

  async getRequestById(id: string): Promise<ResupplyRequest> {
    const request = await this.resupplyRepository.findById(id);
    if (!request) {
      throw new Error(`Resupply request with id ${id} not found`);
    }
    return request;
  }

  async getRequestsByStatus(status: string): Promise<ResupplyRequest[]> {
    return await this.resupplyRepository.findByStatus(status);
  }

  async getRequestsByResourceType(resourceType: string): Promise<ResupplyRequest[]> {
    return await this.resupplyRepository.findByResourceType(resourceType);
  }

  async createRequest(dto: CreateResupplyRequestDto): Promise<ResupplyRequest> {
    if (dto.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    return await this.resupplyRepository.create(dto);
  }

  async updateRequest(id: string, dto: UpdateResupplyRequestDto): Promise<ResupplyRequest> {
    const updated = await this.resupplyRepository.update(id, dto);
    if (!updated) {
      throw new Error(`Resupply request with id ${id} not found`);
    }
    return updated;
  }

  async approveRequest(id: string, approvedBy: string): Promise<ResupplyRequest> {
    return await this.updateRequest(id, {
      status: 'approved',
      approvedBy,
    });
  }

  async cancelRequest(id: string): Promise<ResupplyRequest> {
    return await this.updateRequest(id, {
      status: 'cancelled',
    });
  }

  async deleteRequest(id: string): Promise<void> {
    const deleted = await this.resupplyRepository.delete(id);
    if (!deleted) {
      throw new Error(`Resupply request with id ${id} not found`);
    }
  }
}
