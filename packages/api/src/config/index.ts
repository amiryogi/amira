import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
  ),
});

const requiredEnvVars = [
  'MONGO_URI',
  'ACCESS_SECRET',
  'REFRESH_SECRET',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  // Database
  mongoUri: process.env.MONGO_URI!,

  // JWT
  accessSecret: process.env.ACCESS_SECRET!,
  refreshSecret: process.env.REFRESH_SECRET!,

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // eSewa
  esewa: {
    secret: process.env.ESEWA_SECRET || '',
    productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
    baseUrl: process.env.ESEWA_BASE_URL || 'https://rc-epay.esewa.com.np',
  },

  // SMTP
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@amira.com.np',
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  cors: {
    allowedOrigins: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.ADMIN_URL || 'http://localhost:5174',
    ].filter(Boolean) as string[],
  },

  // Redis (optional — for Socket.IO horizontal scaling)
  redis: {
    url: process.env.REDIS_URL || '',
  },

  // Bcrypt
  bcryptSaltRounds: 12,
} as const;
