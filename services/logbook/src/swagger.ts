import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'LogBook Service API',
    version: '1.0.0',
    description: 'API documentation for the LogBook microservice.'
  },
  paths: {
    '/jobs': {
      post: {
        summary: 'Create a new job',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Job' }
            }
          }
        },
        responses: {
          201: { description: 'Job created' },
          500: { description: 'Error' }
        }
      },
      get: {
        summary: 'List jobs (optionally by direction)',
        parameters: [
          {
            name: 'direction',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['import', 'export'] }
          }
        ],
        responses: {
          200: { description: 'List of jobs' },
          500: { description: 'Error' }
        }
      }
    },
    '/jobs/{id}': {
      get: {
        summary: 'Get job by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Job details' },
          404: { description: 'Not found' },
          500: { description: 'Error' }
        }
      },
      patch: {
        summary: 'Update job',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Job' }
            }
          }
        },
        responses: {
          200: { description: 'Job updated' },
          404: { description: 'Not found' },
          500: { description: 'Error' }
        }
      }
    }
  },
  components: {
    schemas: {
      Job: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          bookId: { type: 'string' },
          direction: { type: 'string', enum: ['import', 'export'] },
          type: { type: 'string', enum: ['epub', 'pdf', 'word', 'wattpad', 'evernote'] },
          state: { type: 'string', enum: ['pending', 'processing', 'finished', 'failed'] },
          sourceUrl: { type: 'string' },
          resultUrl: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          startedAt: { type: 'string' }
        },
        required: ['id', 'bookId', 'direction', 'type', 'state', 'createdAt', 'updatedAt']
      }
    }
  }
};

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
