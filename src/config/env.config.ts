import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mars_cargo',
  resourceUpdateInterval: parseInt(process.env.RESOURCE_UPDATE_INTERVAL || '5000', 10),
  alertCheckInterval: parseInt(process.env.ALERT_CHECK_INTERVAL || '10000', 10),
};

export function validateConfig(): void {
  if (config.port < 0 || config.port > 65535) {
    throw new Error('Invalid PORT configuration');
  }

  if (config.resourceUpdateInterval < 1000) {
    console.warn('RESOURCE_UPDATE_INTERVAL is too low, setting to 1000ms');
    config.resourceUpdateInterval = 1000;
  }

  if (config.alertCheckInterval < 5000) {
    console.warn('ALERT_CHECK_INTERVAL is too low, setting to 5000ms');
    config.alertCheckInterval = 5000;
  }
}
