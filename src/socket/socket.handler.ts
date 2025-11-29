import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { ResourceService, AlertService } from '../services';
import type { RoverService } from '../services/rover.service';
import type { AnalyticsService } from '../services/analytics.service';

export class SocketHandler {
  private io: SocketServer;
  private updateInterval?: NodeJS.Timeout;
  private alertCheckInterval?: NodeJS.Timeout;
  private roverUpdateInterval?: NodeJS.Timeout;
  private metricsCollectionInterval?: NodeJS.Timeout;

  constructor(
    httpServer: HttpServer,
    private resourceService: ResourceService,
    private alertService: AlertService,
    private roverService: RoverService,
    private analyticsService: AnalyticsService
  ) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', async (socket) => {
      console.log(`Client connected: ${socket.id}`);

      const resources = await this.resourceService.getAllResources();
      socket.emit('resources:initial', resources);

      const alerts = await this.alertService.getAllAlerts();
      socket.emit('alerts:initial', alerts);

      const rovers = await this.roverService.getAllRovers();
      socket.emit('rovers:initial', rovers);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      socket.on('resource:subscribe', (resourceId: string) => {
        socket.join(`resource:${resourceId}`);
        console.log(`Client ${socket.id} subscribed to resource ${resourceId}`);
      });

      socket.on('resource:unsubscribe', (resourceId: string) => {
        socket.leave(`resource:${resourceId}`);
        console.log(`Client ${socket.id} unsubscribed from resource ${resourceId}`);
      });
    });
  }

  startResourceUpdates(intervalMs: number = 5000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        await this.resourceService.simulateConsumption();

        const resources = await this.resourceService.getAllResources();

        const updatePromises = resources.map(async (resource) => {
          const trend = await this.resourceService.calculateTrend(resource);
          const updated = await this.resourceService.updateResource(resource.id, {
            currentLevel: resource.currentLevel,
            trend
          });

          if (updated) {
            this.io.to(`resource:${resource.id}`).emit('resource:updated', updated);
          }

          return updated;
        });

        await Promise.all(updatePromises);

        const updatedResources = await this.resourceService.getAllResources();
        this.io.emit('resources:updated', updatedResources);
      } catch (error) {
        console.error('Error in resource update interval:', error);
      }
    }, intervalMs);

    console.log(`Resource updates started (interval: ${intervalMs}ms)`);
  }

  startAlertChecks(intervalMs: number = 10000): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }

    this.alertCheckInterval = setInterval(async () => {
      try {
        const resources = await this.resourceService.getAllResources();

        const alertPromises = resources.map(async (resource) => {
          const status = this.resourceService.getResourceStatus(resource);

          if (status === 'critical') {
            const existingAlerts = await this.alertService.getAlertsByResourceId(resource.id);
            const hasUnacknowledgedCritical = existingAlerts.some(
              (alert) => !alert.acknowledged && alert.level === 'critical'
            );

            if (!hasUnacknowledgedCritical) {
              const alert = await this.alertService.createAlert({
                resourceId: resource.id,
                resourceName: resource.name,
                level: 'critical',
                message: `${resource.name} has reached critical level (${((resource.currentLevel / resource.maxCapacity) * 100).toFixed(1)}%). Immediate action required.`,
              });

              this.io.emit('alert:created', alert);
              console.log(`Critical alert created for ${resource.name}`);
            }
          }
        });

        await Promise.all(alertPromises);
      } catch (error) {
        console.error('Error in alert check interval:', error);
      }
    }, intervalMs);

    console.log(`Alert checks started (interval: ${intervalMs}ms)`);
  }

  emitResourceUpdate(resource: any): void {
    this.io.emit('resource:updated', resource);
    this.io.to(`resource:${resource.id}`).emit('resource:updated', resource);
  }

  emitAlertCreated(alert: any): void {
    this.io.emit('alert:created', alert);
  }

  emitAlertAcknowledged(alert: any): void {
    this.io.emit('alert:acknowledged', alert);
  }

  emitResupplyRequestCreated(request: any): void {
    this.io.emit('resupply:created', request);
  }

  emitResupplyRequestUpdated(request: any): void {
    this.io.emit('resupply:updated', request);
  }

  startRoverUpdates(intervalMs: number = 3000): void {
    if (this.roverUpdateInterval) {
      clearInterval(this.roverUpdateInterval);
    }

    this.roverUpdateInterval = setInterval(async () => {
      try {
        await this.roverService.simulateRoverUpdates();

        const rovers = await this.roverService.getAllRovers();
        this.io.emit('rovers:updated', rovers);
      } catch (error) {
        console.error('Error in rover update interval:', error);
      }
    }, intervalMs);

    console.log(`Rover updates started (interval: ${intervalMs}ms)`);
  }

  startMetricsCollection(intervalMs: number = 300000): void {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }

    // Collect initial metrics
    this.collectMetrics();

    this.metricsCollectionInterval = setInterval(async () => {
      await this.collectMetrics();
    }, intervalMs);

    console.log(`Metrics collection started (interval: ${intervalMs}ms = ${intervalMs / 60000} minutes)`);
  }

  private async collectMetrics(): Promise<void> {
    try {
      const resources = await this.resourceService.getAllResources();

      const metricPromises = resources.map(async (resource) => {
        await this.analyticsService.recordMetric({
          resourceId: resource.id,
          resourceType: resource.type,
          timestamp: new Date(),
          level: resource.currentLevel,
          consumptionRate: resource.consumptionRate || 0,
          metadata: {},
        });
      });

      await Promise.all(metricPromises);
      console.log(`Collected metrics for ${resources.length} resources`);
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }

    if (this.roverUpdateInterval) {
      clearInterval(this.roverUpdateInterval);
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }

    this.io.close();
    console.log('Socket.IO server stopped');
  }
}
