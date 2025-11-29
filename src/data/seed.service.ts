import { ResourceModel } from '../models/resource.model';
import { AlertModel } from '../models/alert.model';
import { ResupplyRequestModel } from '../models/resupply.model';
import { seedResources, seedAlerts, seedResupplyRequests } from './seed.data';

export class SeedService {
  async seedDatabase(): Promise<void> {
    try {
      console.log('Starting database seeding...');

      await this.seedResources();
      await this.seedAlerts();
      await this.seedResupplyRequests();

      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  private async seedResources(): Promise<void> {
    const existingCount = await ResourceModel.countDocuments();

    if (existingCount > 0) {
      console.log(`Resources already exist (${existingCount} found), skipping seed`);
      return;
    }

    console.log('Seeding resources...');

    const resources = seedResources.map(resource => ({
      ...resource,
      lastUpdated: new Date(),
    }));

    await ResourceModel.insertMany(resources);
    console.log(`Seeded ${resources.length} resources`);
  }

  private async seedAlerts(): Promise<void> {
    const existingCount = await AlertModel.countDocuments();

    if (existingCount > 0) {
      console.log(`Alerts already exist (${existingCount} found), skipping seed`);
      return;
    }

    console.log('Seeding alerts...');

    const alerts = seedAlerts.map(alert => ({
      ...alert,
      timestamp: new Date(alert.timestamp),
      acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
    }));

    await AlertModel.insertMany(alerts);
    console.log(`Seeded ${alerts.length} alerts`);
  }

  private async seedResupplyRequests(): Promise<void> {
    const existingCount = await ResupplyRequestModel.countDocuments();

    if (existingCount > 0) {
      console.log(`Resupply requests already exist (${existingCount} found), skipping seed`);
      return;
    }

    console.log('Seeding resupply requests...');

    const requests = seedResupplyRequests.map(request => ({
      ...request,
      requestedAt: new Date(request.requestedAt),
      estimatedDelivery: request.estimatedDelivery ? new Date(request.estimatedDelivery) : undefined,
      approvedAt: request.approvedAt ? new Date(request.approvedAt) : undefined,
      deliveredAt: request.deliveredAt ? new Date(request.deliveredAt) : undefined,
      cancelledAt: request.cancelledAt ? new Date(request.cancelledAt) : undefined,
    }));

    await ResupplyRequestModel.insertMany(requests);
    console.log(`Seeded ${requests.length} resupply requests`);
  }

  async clearDatabase(): Promise<void> {
    console.log('Clearing database...');

    await ResourceModel.deleteMany({});
    await AlertModel.deleteMany({});
    await ResupplyRequestModel.deleteMany({});

    console.log('Database cleared');
  }
}

export const seedService = new SeedService();
