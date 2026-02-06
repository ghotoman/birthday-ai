import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  corsOrigins: process.env.CORS_ORIGINS || '*',
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '30', 10),
};

export function validateConfig() {
  if (!config.openrouterApiKey) {
    console.error('❌ OPENROUTER_API_KEY не задан в .env');
    process.exit(1);
  }
}
