import { ResupplyRepository } from '../repositories';
import { ResupplyRequest, CreateResupplyRequestDto, UpdateResupplyRequestDto } from '../types';

export class ResupplyService {
  constructor(private resupplyRepository: ResupplyRepository) {}

  getAllRequests(): ResupplyRequest[] {
    return this.resupplyRepository.findAll();
  }

  getRequestById(id: string): ResupplyRequest {
    const request = this.resupplyRepository.findById(id);
    if (!request) {
      throw new Error(`Resupply request with id ${id} not found`);
    }
    return request;
  }

  getRequestsByStatus(status: string): ResupplyRequest[] {
    return this.resupplyRepository.findByStatus(status);
  }

  getRequestsByResourceType(resourceType: string): ResupplyRequest[] {
    return this.resupplyRepository.findByResourceType(resourceType);
  }

  createRequest(dto: CreateResupplyRequestDto): ResupplyRequest {
    if (dto.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    return this.resupplyRepository.create(dto);
  }

  updateRequest(id: string, dto: UpdateResupplyRequestDto): ResupplyRequest {
    const updated = this.resupplyRepository.update(id, dto);
    if (!updated) {
      throw new Error(`Resupply request with id ${id} not found`);
    }
    return updated;
  }

  approveRequest(id: string, approvedBy: string): ResupplyRequest {
    return this.updateRequest(id, {
      status: 'approved',
      approvedBy,
    });
  }

  cancelRequest(id: string): ResupplyRequest {
    return this.updateRequest(id, {
      status: 'cancelled',
    });
  }

  deleteRequest(id: string): void {
    const deleted = this.resupplyRepository.delete(id);
    if (!deleted) {
      throw new Error(`Resupply request with id ${id} not found`);
    }
  }
}
