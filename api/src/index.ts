import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config, validateConfig } from './config';
import { generateRoutes } from './routes/generate';
import { healthRoutes } from './routes/health';

validateConfig();

const isDev = process.env.NODE_ENV !== 'production';

const app = Fastify({
  logger: isDev
    ? { level: 'info', transport: { target: 'pino-pretty', options: { colorize: true } } }
    : { level: 'info' },
});

async function start() {
  // CORS
  await app.register(cors, {
    origin: config.corsOrigins === '*' ? true : config.corsOrigins.split(','),
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: config.rateLimitPerMinute,
    timeWindow: '1 minute',
  });

  // Routes
  await app.register(healthRoutes);
  await app.register(generateRoutes);

  // Start
  await app.listen({ port: config.port, host: config.host });
  console.log(`🚀 BirthdayAI API running on http://${config.host}:${config.port}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
