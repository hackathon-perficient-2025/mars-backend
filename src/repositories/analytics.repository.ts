import { ResourceMetricModel, AnomalyModel } from "../models/analytics.model";
import type {
  ResourceMetric,
  Anomaly,
  AnalyticsQuery,
} from "../types/analytics.types";
import { randomUUID } from "crypto";

export class AnalyticsRepository {
  async createMetric(
    data: Omit<ResourceMetric, "id">
  ): Promise<ResourceMetric> {
    const metric = await ResourceMetricModel.create({
      id: randomUUID(),
      ...data,
    });
    return this.mapToMetric(metric.toJSON());
  }

  async getMetrics(query: AnalyticsQuery): Promise<ResourceMetric[]> {
    const { resourceId, resourceType, timeRange, startDate, endDate } = query;

    const filter: any = {};

    if (resourceId) {
      filter.resourceId = resourceId;
    }

    if (resourceType) {
      filter.resourceType = resourceType;
    }

    if (startDate || endDate || timeRange) {
      filter.timestamp = {};

      if (startDate) {
        filter.timestamp.$gte = startDate;
      }

      if (endDate) {
        filter.timestamp.$lte = endDate;
      }

      if (timeRange && !startDate) {
        const now = new Date();
        const ranges = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
          "90d": 90 * 24 * 60 * 60 * 1000,
        };
        filter.timestamp.$gte = new Date(now.getTime() - ranges[timeRange]);
      }
    }

    const metrics = await ResourceMetricModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(10000)
      .lean();

    return metrics.map(this.mapToMetric);
  }

  async createAnomaly(data: Omit<Anomaly, "id">): Promise<Anomaly> {
    const anomaly = await AnomalyModel.create({
      id: randomUUID(),
      ...data,
    });
    return this.mapToAnomaly(anomaly.toJSON());
  }

  async getAnomalies(query: AnalyticsQuery): Promise<Anomaly[]> {
    const { resourceId, resourceType, timeRange, startDate, endDate } = query;

    const filter: any = {};

    if (resourceId) {
      filter.resourceId = resourceId;
    }

    if (resourceType) {
      filter.resourceType = resourceType;
    }

    if (startDate || endDate || timeRange) {
      filter.timestamp = {};

      if (startDate) {
        filter.timestamp.$gte = startDate;
      }

      if (endDate) {
        filter.timestamp.$lte = endDate;
      }

      if (timeRange && !startDate) {
        const now = new Date();
        const ranges = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
          "90d": 90 * 24 * 60 * 60 * 1000,
        };
        filter.timestamp.$gte = new Date(now.getTime() - ranges[timeRange]);
      }
    }

    const anomalies = await AnomalyModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(1000)
      .lean();

    return anomalies.map(this.mapToAnomaly);
  }

  async getLatestMetric(resourceId: string): Promise<ResourceMetric | null> {
    const metric = await ResourceMetricModel.findOne({ resourceId })
      .sort({ timestamp: -1 })
      .lean();

    return metric ? this.mapToMetric(metric) : null;
  }

  private mapToMetric(doc: any): ResourceMetric {
    return {
      id: doc.id,
      resourceId: doc.resourceId,
      resourceType: doc.resourceType,
      timestamp: doc.timestamp,
      level: doc.level,
      consumptionRate: doc.consumptionRate,
      metadata: doc.metadata,
    };
  }

  private mapToAnomaly(doc: any): Anomaly {
    return {
      id: doc.id,
      resourceId: doc.resourceId,
      resourceType: doc.resourceType,
      timestamp: doc.timestamp,
      type: doc.type,
      severity: doc.severity,
      description: doc.description,
      expectedValue: doc.expectedValue,
      actualValue: doc.actualValue,
      deviation: doc.deviation,
    };
  }
}
