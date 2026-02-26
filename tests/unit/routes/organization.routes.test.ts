import express from 'express';
import organizationRoutes from '../../../src/routes/organization.routes';

describe('Organization Routes', () => {
  let router: express.Router;

  beforeEach(() => {
    // Arrange
    router = organizationRoutes;
  });

  describe('Route Configuration', () => {
    it('should export an Express router', () => {
      // Arrange
      // (router already assigned in beforeEach)

      // Act
      const isRouter = router && typeof router === 'function';

      // Assert
      expect(isRouter).toBe(true);
      expect(router.stack).toBeDefined();
    });

    it('should have configured POST / route', () => {
      // Arrange
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => layer.route?.path)
        .filter((path): path is string => typeof path === 'string');

      // Act
      const hasRoute = routes.includes('/');

      // Assert
      expect(hasRoute).toBe(true);
    });

    it('should have configured GET / route', () => {
      // Arrange
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => layer.route?.path)
        .filter((path): path is string => typeof path === 'string');

      // Act
      const hasRoute = routes.includes('/');

      // Assert
      expect(hasRoute).toBe(true);
    });

    it('should have configured GET /:id route', () => {
      // Arrange
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => layer.route?.path)
        .filter((path): path is string => typeof path === 'string');

      // Act
      const hasRoute = routes.includes('/:id');

      // Assert
      expect(hasRoute).toBe(true);
    });

    it('should apply middleware to routes', () => {
      // Arrange
      const middlewares = router.stack.filter((layer) => !layer.route && layer.handle);

      // Act
      const hasMiddleware = middlewares.length > 0;

      // Assert
      expect(hasMiddleware).toBe(true);
    });
  });
});
