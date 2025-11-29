import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ResourceService, AlertService } from '../services';

export class SocketHandler {
  private io: SocketServer;
  private updateInterval?: NodeJS.Timeout;
  private alertCheckInterval?: NodeJS.Timeout;

  constructor(
    httpServer: HttpServer,
    private resourceService: ResourceService,
    private alertService: AlertService
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
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      const resources = this.resourceService.getAllResources();
      socket.emit('resources:initial', resources);

      const alerts = this.alertService.getAllAlerts();
      socket.emit('alerts:initial', alerts);

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

    this.updateInterval = setInterval(() => {
      this.resourceService.simulateConsumption();

      const resources = this.resourceService.getAllResources();

      resources.forEach((resource) => {
        const trend = this.resourceService.calculateTrend(resource);
        const updated = this.resourceService.updateResource(resource.id, { currentLevel: resource.currentLevel });

        if (updated) {
          updated.trend = trend;
          this.io.to(`resource:${resource.id}`).emit('resource:updated', updated);
        }
      });

      this.io.emit('resources:updated', resources);
    }, intervalMs);

    console.log(`Resource updates started (interval: ${intervalMs}ms)`);
  }

  startAlertChecks(intervalMs: number = 10000): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }

    this.alertCheckInterval = setInterval(() => {
      const resources = this.resourceService.getAllResources();

      resources.forEach((resource) => {
        const status = this.resourceService.getResourceStatus(resource);

        if (status === 'critical') {
          const existingAlerts = this.alertService.getAlertsByResourceId(resource.id);
          const hasUnacknowledgedCritical = existingAlerts.some(
            (alert) => !alert.acknowledged && alert.level === 'critical'
          );

          if (!hasUnacknowledgedCritical) {
            const alert = this.alertService.createAlert({
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

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }

    this.io.close();
    console.log('Socket.IO server stopped');
  }
}
