import { Hono } from 'hono';
import { registry } from './mcp/registry';
import { githubHandlers, githubService } from './mcp/services/github';
import { n8nHandlers, n8nService } from './mcp/services/n8n';
import apiRoutes from './routes/api';
import mcpRoutes from './routes/mcp';

// Register MCP services
registry.register(githubService, githubHandlers);
registry.register(n8nService, n8nHandlers);

const app = new Hono();

// Mount routes
app.route('/api', apiRoutes);
app.route('/mcp', mcpRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'MCP Base API',
    version: '0.0.1',
    endpoints: {
      api: '/api/services',
      mcp: '/mcp',
      health: '/api/health',
    },
  });
});

export default app;
