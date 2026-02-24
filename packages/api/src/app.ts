import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { registerRoutes } from './routes/index.js';

const app = express();

// ─── Security ───
app.use(helmet());
app.use(
  cors({
    origin: [config.frontendUrl, config.adminUrl],
    credentials: true,
  }),
);

// ─── Cookie parsing ───
app.use(cookieParser());

// ─── Body parsing ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Compression ───
app.use(compression());

// ─── Routes ───
registerRoutes(app);

// ─── Health check ───
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global error handler (must be last) ───
app.use(errorHandler);

export { app };
