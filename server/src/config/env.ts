import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

function required(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value && isProduction) {
    throw new Error(`Missing required production environment variable: ${name}`);
  }
  return value || '';
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: required('MONGODB_URI', isProduction ? undefined : 'mongodb://127.0.0.1:27017/amar_ain'),
  jwtSecret: required('JWT_SECRET', isProduction ? undefined : 'development-only-change-me'),
  clientUrl: process.env.CLIENT_URL || (isProduction ? '' : 'http://localhost:5173'),
};
