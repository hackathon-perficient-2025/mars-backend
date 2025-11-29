import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env.config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Mars Base Cargo Control API',
    version: '1.0.0',
    description: 'RESTful API for Mars Base resource monitoring and management system',
    contact: {
      name: 'PERFICIENT',
      email: 'support@perficient.com',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api`,
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Resources',
      description: 'Resource management endpoints',
    },
    {
      name: 'Alerts',
      description: 'Alert management endpoints',
    },
    {
      name: 'Resupply',
      description: 'Resupply request management endpoints',
    },
    {
      name: 'Health',
      description: 'System health check',
    },
  ],
  components: {
    schemas: {
      Resource: {
        type: 'object',
        required: ['id', 'type', 'name', 'currentLevel', 'maxCapacity', 'unit', 'criticalThreshold', 'warningThreshold'],
        properties: {
          id: {
            type: 'string',
            description: 'Resource unique identifier',
            example: 'res-oxygen-001',
          },
          type: {
            type: 'string',
            enum: [
              'oxygen',
              'water',
              'spare_parts',
              'food',
              'trees',
              'solar_robots',
              'energy_storage',
              'medical_supplies',
              'sewage_capacity',
              'arable_land',
              'pollinators',
              'freshwater_aquifer',
              'batteries',
              'population',
            ],
            description: 'Resource type',
          },
          name: {
            type: 'string',
            description: 'Resource name',
            example: 'Oxygen Supply',
          },
          currentLevel: {
            type: 'number',
            description: 'Current resource level',
            example: 7200,
          },
          maxCapacity: {
            type: 'number',
            description: 'Maximum capacity',
            example: 10000,
          },
          unit: {
            type: 'string',
            description: 'Unit of measurement',
            example: 'kg',
          },
          criticalThreshold: {
            type: 'number',
            description: 'Critical threshold percentage',
            example: 20,
          },
          warningThreshold: {
            type: 'number',
            description: 'Warning threshold percentage',
            example: 40,
          },
          lastUpdated: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
          trend: {
            type: 'string',
            enum: ['increasing', 'decreasing', 'stable'],
            description: 'Resource trend',
          },
          estimatedDaysRemaining: {
            type: ['number', 'null'],
            description: 'Estimated days until depletion (null for resources with no depletion)',
            example: 45,
          },
          consumptionRate: {
            type: 'number',
            description: 'Daily consumption rate',
            example: 160,
          },
        },
      },
      CreateResourceDto: {
        type: 'object',
        required: ['type', 'name', 'currentLevel', 'maxCapacity', 'unit', 'criticalThreshold', 'warningThreshold'],
        properties: {
          type: {
            type: 'string',
            enum: [
              'oxygen',
              'water',
              'spare_parts',
              'food',
              'trees',
              'solar_robots',
              'energy_storage',
              'medical_supplies',
              'sewage_capacity',
              'arable_land',
              'pollinators',
              'freshwater_aquifer',
              'batteries',
              'population',
            ],
          },
          name: {
            type: 'string',
            example: 'Oxygen Supply',
          },
          currentLevel: {
            type: 'number',
            example: 7200,
          },
          maxCapacity: {
            type: 'number',
            example: 10000,
          },
          unit: {
            type: 'string',
            example: 'kg',
          },
          criticalThreshold: {
            type: 'number',
            example: 20,
          },
          warningThreshold: {
            type: 'number',
            example: 40,
          },
        },
      },
      UpdateResourceDto: {
        type: 'object',
        properties: {
          currentLevel: {
            type: 'number',
            example: 7000,
          },
          maxCapacity: {
            type: 'number',
            example: 10000,
          },
          criticalThreshold: {
            type: 'number',
            example: 20,
          },
          warningThreshold: {
            type: 'number',
            example: 40,
          },
        },
      },
      Alert: {
        type: 'object',
        required: ['id', 'resourceId', 'resourceName', 'level', 'message', 'timestamp', 'acknowledged'],
        properties: {
          id: {
            type: 'string',
            description: 'Alert unique identifier',
            example: 'alert-001',
          },
          resourceId: {
            type: 'string',
            description: 'Associated resource ID',
            example: 'res-oxygen-001',
          },
          resourceName: {
            type: 'string',
            description: 'Resource name',
            example: 'Oxygen Supply',
          },
          level: {
            type: 'string',
            enum: ['critical', 'warning', 'info'],
            description: 'Alert severity level',
          },
          message: {
            type: 'string',
            description: 'Alert message',
            example: 'Oxygen levels critical',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Alert creation timestamp',
          },
          acknowledged: {
            type: 'boolean',
            description: 'Whether alert has been acknowledged',
          },
          acknowledgedBy: {
            type: 'string',
            description: 'Person who acknowledged',
            example: 'Commander Sarah Chen',
          },
          acknowledgedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Acknowledgment timestamp',
          },
        },
      },
      CreateAlertDto: {
        type: 'object',
        required: ['resourceId', 'resourceName', 'level', 'message'],
        properties: {
          resourceId: {
            type: 'string',
            example: 'res-oxygen-001',
          },
          resourceName: {
            type: 'string',
            example: 'Oxygen Supply',
          },
          level: {
            type: 'string',
            enum: ['critical', 'warning', 'info'],
          },
          message: {
            type: 'string',
            example: 'Oxygen levels critical',
          },
        },
      },
      AcknowledgeAlertDto: {
        type: 'object',
        required: ['acknowledgedBy'],
        properties: {
          acknowledgedBy: {
            type: 'string',
            example: 'Commander Sarah Chen',
          },
        },
      },
      ResupplyRequest: {
        type: 'object',
        required: ['id', 'resourceType', 'quantity', 'priority', 'status', 'requestedBy', 'requestedAt'],
        properties: {
          id: {
            type: 'string',
            description: 'Request unique identifier',
            example: 'req-001',
          },
          resourceType: {
            type: 'string',
            enum: ['oxygen', 'water', 'spare_parts', 'food'],
          },
          quantity: {
            type: 'number',
            example: 2000,
          },
          priority: {
            type: 'string',
            enum: ['urgent', 'high', 'normal'],
          },
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'in_transit', 'delivered', 'cancelled'],
          },
          requestedBy: {
            type: 'string',
            example: 'Commander Sarah Chen',
          },
          requestedAt: {
            type: 'string',
            format: 'date-time',
          },
          notes: {
            type: 'string',
            example: 'Emergency resupply needed',
          },
          estimatedDelivery: {
            type: 'string',
            format: 'date-time',
          },
          approvedBy: {
            type: 'string',
            example: 'Mission Control',
          },
          approvedAt: {
            type: 'string',
            format: 'date-time',
          },
          deliveredAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateResupplyRequestDto: {
        type: 'object',
        required: ['resourceType', 'quantity', 'priority', 'requestedBy'],
        properties: {
          resourceType: {
            type: 'string',
            enum: ['oxygen', 'water', 'spare_parts', 'food'],
          },
          quantity: {
            type: 'number',
            example: 2000,
          },
          priority: {
            type: 'string',
            enum: ['urgent', 'high', 'normal'],
          },
          requestedBy: {
            type: 'string',
            example: 'Commander Sarah Chen',
          },
          notes: {
            type: 'string',
            example: 'Emergency resupply needed',
          },
        },
      },
      UpdateResupplyRequestDto: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'in_transit', 'delivered', 'cancelled'],
          },
          approvedBy: {
            type: 'string',
            example: 'Mission Control',
          },
          notes: {
            type: 'string',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Resource not found',
              },
            },
          },
        },
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'healthy',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
          uptime: {
            type: 'number',
            description: 'Server uptime in seconds',
            example: 3600,
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
