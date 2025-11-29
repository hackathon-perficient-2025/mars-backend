export type ResourceType = 'oxygen' | 'water' | 'spare_parts' | 'food';

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  currentLevel: number;
  maxCapacity: number;
  unit: string;
  criticalThreshold: number;
  warningThreshold: number;
  lastUpdated: Date;
  trend?: 'increasing' | 'decreasing' | 'stable';
  estimatedDaysRemaining?: number;
  consumptionRate?: number;
}

export interface ResourceUpdate {
  resourceId: string;
  newLevel: number;
  timestamp: Date;
}

export interface ResourceHistory {
  resourceId: string;
  timestamp: Date;
  level: number;
}

export interface ResourceStatus {
  status: 'critical' | 'warning' | 'normal' | 'optimal';
  percentage: number;
}

export interface CreateResourceDto {
  type: ResourceType;
  name: string;
  currentLevel: number;
  maxCapacity: number;
  unit: string;
  criticalThreshold: number;
  warningThreshold: number;
}

export interface UpdateResourceDto {
  currentLevel?: number;
  maxCapacity?: number;
  criticalThreshold?: number;
  warningThreshold?: number;
}
