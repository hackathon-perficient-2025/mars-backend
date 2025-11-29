import { AnalyticsRepository } from '../repositories/analytics.repository';
import type {
  ResourceMetric,
  Anomaly,
  TrendData,
  AggregatedStats,
  LinearRegression,
  AnalyticsQuery,
} from '../types/analytics.types';

export class AnalyticsService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async recordMetric(data: Omit<ResourceMetric, 'id'>): Promise<ResourceMetric> {
    return await this.analyticsRepository.createMetric(data);
  }

  async getTrendData(query: AnalyticsQuery): Promise<TrendData[]> {
    const metrics = await this.analyticsRepository.getMetrics(query);

    if (metrics.length === 0) {
      return [];
    }

    // Group metrics by resourceId
    const grouped = new Map<string, ResourceMetric[]>();
    metrics.forEach((metric) => {
      const existing = grouped.get(metric.resourceId) || [];
      existing.push(metric);
      grouped.set(metric.resourceId, existing);
    });

    const trends: TrendData[] = [];

    for (const [resourceId, resourceMetrics] of grouped.entries()) {
      const sortedMetrics = resourceMetrics.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const firstLevel = sortedMetrics[0].level;
      const lastLevel = sortedMetrics[sortedMetrics.length - 1].level;
      const changePercentage =
        firstLevel !== 0 ? ((lastLevel - firstLevel) / firstLevel) * 100 : 0;

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (changePercentage > 5) trend = 'increasing';
      if (changePercentage < -5) trend = 'decreasing';

      // Calculate average consumption
      const totalConsumption = sortedMetrics.reduce(
        (sum, m) => sum + m.consumptionRate,
        0
      );
      const averageConsumption = totalConsumption / sortedMetrics.length;

      // Perform linear regression for predictions
      const regression = this.calculateLinearRegression(sortedMetrics);
      const predictions = regression.predictions.slice(0, 10); // Next 10 data points

      const data = sortedMetrics.map((m, idx) => ({
        timestamp: m.timestamp,
        level: m.level,
        predictedLevel: predictions[idx]?.predictedLevel,
      }));

      trends.push({
        resourceId,
        resourceType: sortedMetrics[0].resourceType,
        timeRange: query.timeRange,
        data,
        trend,
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        averageConsumption: parseFloat(averageConsumption.toFixed(2)),
      });
    }

    return trends;
  }

  async getAggregatedStats(query: AnalyticsQuery): Promise<AggregatedStats[]> {
    const metrics = await this.analyticsRepository.getMetrics(query);

    if (metrics.length === 0) {
      return [];
    }

    // Group by resourceId
    const grouped = new Map<string, ResourceMetric[]>();
    metrics.forEach((metric) => {
      const existing = grouped.get(metric.resourceId) || [];
      existing.push(metric);
      grouped.set(metric.resourceId, existing);
    });

    const stats: AggregatedStats[] = [];

    for (const [resourceId, resourceMetrics] of grouped.entries()) {
      const levels = resourceMetrics.map((m) => m.level).sort((a, b) => a - b);

      const min = Math.min(...levels);
      const max = Math.max(...levels);
      const average = levels.reduce((sum, l) => sum + l, 0) / levels.length;
      const median =
        levels.length % 2 === 0
          ? (levels[levels.length / 2 - 1] + levels[levels.length / 2]) / 2
          : levels[Math.floor(levels.length / 2)];

      // Standard deviation
      const variance =
        levels.reduce((sum, l) => sum + Math.pow(l - average, 2), 0) / levels.length;
      const stdDeviation = Math.sqrt(variance);

      // Total consumption
      const totalConsumption = resourceMetrics.reduce(
        (sum, m) => sum + m.consumptionRate,
        0
      );

      // Find peak usage times (top 5)
      const peakUsageTimes = resourceMetrics
        .sort((a, b) => b.consumptionRate - a.consumptionRate)
        .slice(0, 5)
        .map((m) => ({
          timestamp: m.timestamp,
          level: m.level,
        }));

      stats.push({
        resourceId,
        resourceType: resourceMetrics[0].resourceType,
        timeRange: query.timeRange,
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        average: parseFloat(average.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        stdDeviation: parseFloat(stdDeviation.toFixed(2)),
        totalConsumption: parseFloat(totalConsumption.toFixed(2)),
        peakUsageTimes,
      });
    }

    return stats;
  }

  async detectAnomalies(query: AnalyticsQuery): Promise<Anomaly[]> {
    const metrics = await this.analyticsRepository.getMetrics(query);

    if (metrics.length < 10) {
      return []; // Not enough data for anomaly detection
    }

    const anomalies: Anomaly[] = [];

    // Group by resourceId
    const grouped = new Map<string, ResourceMetric[]>();
    metrics.forEach((metric) => {
      const existing = grouped.get(metric.resourceId) || [];
      existing.push(metric);
      grouped.set(metric.resourceId, existing);
    });

    for (const [resourceId, resourceMetrics] of grouped.entries()) {
      const sortedMetrics = resourceMetrics.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      // Calculate statistics
      const levels = sortedMetrics.map((m) => m.level);
      const average = levels.reduce((sum, l) => sum + l, 0) / levels.length;
      const variance =
        levels.reduce((sum, l) => sum + Math.pow(l - average, 2), 0) / levels.length;
      const stdDeviation = Math.sqrt(variance);

      // Detect anomalies using z-score method
      for (let i = 1; i < sortedMetrics.length; i++) {
        const current = sortedMetrics[i];

        const zScore = Math.abs((current.level - average) / stdDeviation);

        // Spike detection (z-score > 3)
        if (zScore > 3 && current.level > average) {
          const deviation = ((current.level - average) / average) * 100;
          anomalies.push({
            id: `anomaly-${Date.now()}-${Math.random()}`,
            resourceId,
            resourceType: current.resourceType,
            timestamp: current.timestamp,
            type: 'spike',
            severity: this.calculateSeverity(deviation),
            description: `Unusual spike in ${current.resourceType} levels detected`,
            expectedValue: parseFloat(average.toFixed(2)),
            actualValue: current.level,
            deviation: parseFloat(deviation.toFixed(2)),
          });
        }

        // Drop detection (z-score > 3)
        if (zScore > 3 && current.level < average) {
          const deviation = ((average - current.level) / average) * 100;
          anomalies.push({
            id: `anomaly-${Date.now()}-${Math.random()}`,
            resourceId,
            resourceType: current.resourceType,
            timestamp: current.timestamp,
            type: 'drop',
            severity: this.calculateSeverity(deviation),
            description: `Sudden drop in ${current.resourceType} levels detected`,
            expectedValue: parseFloat(average.toFixed(2)),
            actualValue: current.level,
            deviation: parseFloat(deviation.toFixed(2)),
          });
        }

        // Leak detection (rapid, consistent decrease)
        if (i >= 5) {
          const recentMetrics = sortedMetrics.slice(i - 5, i);
          const isConsistentDecrease = recentMetrics.every(
            (m, idx) => idx === 0 || m.level < recentMetrics[idx - 1].level
          );
          const totalDecrease =
            recentMetrics[0].level - recentMetrics[recentMetrics.length - 1].level;
          const avgDecreaseRate = totalDecrease / 5;

          if (isConsistentDecrease && avgDecreaseRate > stdDeviation * 0.5) {
            const deviation = (totalDecrease / recentMetrics[0].level) * 100;
            anomalies.push({
              id: `anomaly-${Date.now()}-${Math.random()}`,
              resourceId,
              resourceType: current.resourceType,
              timestamp: current.timestamp,
              type: 'leak_detected',
              severity: this.calculateSeverity(deviation),
              description: `Potential leak detected in ${current.resourceType} - consistent rapid decrease over last 5 measurements`,
              expectedValue: parseFloat(recentMetrics[0].level.toFixed(2)),
              actualValue: current.level,
              deviation: parseFloat(deviation.toFixed(2)),
            });
          }
        }

        // Unusual pattern detection (high variance in short period)
        if (i >= 10) {
          const recent = sortedMetrics.slice(i - 10, i);
          const recentLevels = recent.map((m) => m.level);
          const recentAvg =
            recentLevels.reduce((sum, l) => sum + l, 0) / recentLevels.length;
          const recentVariance =
            recentLevels.reduce((sum, l) => sum + Math.pow(l - recentAvg, 2), 0) /
            recentLevels.length;

          if (recentVariance > variance * 2) {
            const deviation = ((recentVariance - variance) / variance) * 100;
            anomalies.push({
              id: `anomaly-${Date.now()}-${Math.random()}`,
              resourceId,
              resourceType: current.resourceType,
              timestamp: current.timestamp,
              type: 'unusual_pattern',
              severity: this.calculateSeverity(deviation),
              description: `Unusual fluctuation pattern detected in ${current.resourceType}`,
              expectedValue: parseFloat(variance.toFixed(2)),
              actualValue: parseFloat(recentVariance.toFixed(2)),
              deviation: parseFloat(deviation.toFixed(2)),
            });
          }
        }
      }
    }

    // Store detected anomalies
    for (const anomaly of anomalies) {
      await this.analyticsRepository.createAnomaly(anomaly);
    }

    return anomalies;
  }

  async getAnomalies(query: AnalyticsQuery): Promise<Anomaly[]> {
    return await this.analyticsRepository.getAnomalies(query);
  }

  private calculateLinearRegression(metrics: ResourceMetric[]): LinearRegression {
    const n = metrics.length;
    if (n === 0) {
      return {
        slope: 0,
        intercept: 0,
        rSquared: 0,
        predictions: [],
      };
    }

    // Convert timestamps to numeric x values (hours from first measurement)
    const startTime = metrics[0].timestamp.getTime();
    const points = metrics.map((m) => ({
      x: (m.timestamp.getTime() - startTime) / (1000 * 60 * 60), // hours
      y: m.level,
    }));

    // Calculate slope and intercept
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    const ssResidual = points.reduce(
      (sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2),
      0
    );
    const rSquared = 1 - ssResidual / ssTotal;

    // Generate predictions for next time points
    const lastTime = metrics[metrics.length - 1].timestamp.getTime();
    const timeInterval =
      n > 1
        ? (lastTime - startTime) / (n - 1)
        : 1000 * 60 * 60; // Default 1 hour

    const predictions = [];
    const stdError = Math.sqrt(ssResidual / (n - 2));

    for (let predictionIndex = 1; predictionIndex <= 24; predictionIndex++) {
      // Predict next 24 time points
      const futureTime = new Date(lastTime + predictionIndex * timeInterval);
      const x = (futureTime.getTime() - startTime) / (1000 * 60 * 60);
      const predictedLevel = slope * x + intercept;

      // 95% confidence interval
      const margin = 1.96 * stdError;

      predictions.push({
        timestamp: futureTime,
        predictedLevel: parseFloat(Math.max(0, predictedLevel).toFixed(2)),
        confidenceInterval: {
          lower: parseFloat(Math.max(0, predictedLevel - margin).toFixed(2)),
          upper: parseFloat((predictedLevel + margin).toFixed(2)),
        },
      });
    }

    return {
      slope: parseFloat(slope.toFixed(4)),
      intercept: parseFloat(intercept.toFixed(2)),
      rSquared: parseFloat(rSquared.toFixed(4)),
      predictions,
    };
  }

  private calculateSeverity(
    deviation: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (deviation > 50) return 'critical';
    if (deviation > 30) return 'high';
    if (deviation > 15) return 'medium';
    return 'low';
  }
}
