import type { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import type { AnalyticsQuery } from '../types/analytics.types';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getTrends = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: AnalyticsQuery = {
        resourceId: req.query.resourceId as string,
        resourceType: req.query.resourceType as string,
        timeRange: (req.query.timeRange as '24h' | '7d' | '30d' | '90d') || '7d',
        includePredictions: req.query.includePredictions === 'true',
      };

      const trends = await this.analyticsService.getTrendData(query);
      res.json(trends);
    } catch (error) {
      console.error('Error getting trends:', error);
      res.status(500).json({
        error: 'Failed to get trend data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: AnalyticsQuery = {
        resourceId: req.query.resourceId as string,
        resourceType: req.query.resourceType as string,
        timeRange: (req.query.timeRange as '24h' | '7d' | '30d' | '90d') || '7d',
      };

      const stats = await this.analyticsService.getAggregatedStats(query);
      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        error: 'Failed to get aggregated statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  detectAnomalies = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: AnalyticsQuery = {
        resourceId: req.query.resourceId as string,
        resourceType: req.query.resourceType as string,
        timeRange: (req.query.timeRange as '24h' | '7d' | '30d' | '90d') || '7d',
      };

      const anomalies = await this.analyticsService.detectAnomalies(query);
      res.json(anomalies);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      res.status(500).json({
        error: 'Failed to detect anomalies',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getAnomalies = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: AnalyticsQuery = {
        resourceId: req.query.resourceId as string,
        resourceType: req.query.resourceType as string,
        timeRange: (req.query.timeRange as '24h' | '7d' | '30d' | '90d') || '7d',
      };

      const anomalies = await this.analyticsService.getAnomalies(query);
      res.json(anomalies);
    } catch (error) {
      console.error('Error getting anomalies:', error);
      res.status(500).json({
        error: 'Failed to get anomalies',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
