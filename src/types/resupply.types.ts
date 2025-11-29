import { ResourceType } from './resource.types';

export type ResupplyPriority = 'urgent' | 'high' | 'normal';
export type ResupplyStatus = 'pending' | 'approved' | 'in_transit' | 'delivered' | 'cancelled';

export interface ResupplyRequest {
  id: string;
  resourceType: ResourceType;
  quantity: number;
  priority: ResupplyPriority;
  status: ResupplyStatus;
  requestedBy: string;
  requestedAt: Date;
  notes?: string;
  estimatedDelivery?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

export interface CreateResupplyRequestDto {
  resourceType: ResourceType;
  quantity: number;
  priority: ResupplyPriority;
  requestedBy: string;
  notes?: string;
}

export interface UpdateResupplyRequestDto {
  status?: ResupplyStatus;
  approvedBy?: string;
  notes?: string;
}
