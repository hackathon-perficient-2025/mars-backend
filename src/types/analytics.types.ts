export interface ResourceMetric {
  id: string;
  resourceId: string;
  resourceType: string;
  timestamp: Date;
  level: number;
  consumptionRate: number;
  metadata?: {
    temperature?: number;
    pressure?: number;
    humidity?: number;
  };
}

export interface TrendData {
  resourceId: string;
  resourceType: string;
  timeRange: '24h' | '7d' | '30d' | '90d';
  data: Array<{
    timestamp: Date;
    level: number;
    predictedLevel?: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  averageConsumption: number;
}

export interface Anomaly {
  id: string;
  resourceId: string;
  resourceType: string;
  timestamp: Date;
  type: 'spike' | 'drop' | 'leak_detected' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
}

export interface AggregatedStats {
  resourceId: string;
  resourceType: string;
  timeRange: '24h' | '7d' | '30d' | '90d';
  min: number;
  max: number;
  average: number;
  median: number;
  stdDeviation: number;
  totalConsumption: number;
  peakUsageTimes: Array<{
    timestamp: Date;
    level: number;
  }>;
}

export interface LinearRegression {
  slope: number;
  intercept: number;
  rSquared: number;
  predictions: Array<{
    timestamp: Date;
    predictedLevel: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
  }>;
}

export interface AnalyticsQuery {
  resourceId?: string;
  resourceType?: string;
  timeRange: '24h' | '7d' | '30d' | '90d';
  startDate?: Date;
  endDate?: Date;
  includeAnomalies?: boolean;
  includePredictions?: boolean;
}
