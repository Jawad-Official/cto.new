import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/env';
import { testConnection } from './config/database';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFound } from './middleware/errorHandler';
import { setupSocketHandlers } from './socket/socketHandlers';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
  },
});

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

setupSocketHandlers(io);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    httpServer.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`CORS origin: ${config.corsOrigin}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

start();

export { app, io };
