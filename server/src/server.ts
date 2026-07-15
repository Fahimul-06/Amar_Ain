import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: env.isProduction ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

if (env.clientUrl) {
  app.use(cors({ origin: env.clientUrl, credentials: true }));
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'amar-ain-api',
  environment: env.nodeEnv,
  timestamp: new Date().toISOString(),
}));
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

if (env.isProduction) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(currentDir, '../../dist');
  app.use(express.static(clientDist, { maxAge: '1d', etag: true }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: env.isProduction ? 'Internal server error' : (err.message || 'Internal server error') });
});

let server: ReturnType<typeof app.listen> | undefined;

async function start() {
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
  server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`Amar Ain running on port ${env.port} (${env.nodeEnv})`);
  });
}

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server?.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

start().catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});
