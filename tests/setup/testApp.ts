import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from '../../src/routes';
import { errorHandler } from '../../src/middleware/errorHandler';

/**
 * Create Express application for testing
 * Similar to the main server.ts but without listening on a port
 */
export function createTestApp(): Application {
  const app: Application = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware (disabled in tests for cleaner output)
  // app.use((req: Request, _res: Response, next: NextFunction) => {
  //   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  //   next();
  // });

  // Routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Welcome to Contact Service API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        persons: '/api/persons',
        organizations: '/api/organizations'
      }
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
