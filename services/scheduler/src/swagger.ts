import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Scheduler Service API',
    version: '1.0.0',
    description: 'API for managing job queues and dispatching jobs.'
  },
  paths: {
    '/queue': {
      post: {
        summary: 'Enqueue a job',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Job'
              }
            }
          }
        },
        responses: {
          201: { description: 'Job enqueued' },
          400: { description: 'Invalid request' }
        }
      },
      get: {
        summary: 'List all jobs in all queues',
        responses: {
          200: { description: 'Current queues' }
        }
      }
    },
    '/queue/dequeue': {
      post: {
        summary: 'Dequeue a job',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  direction: { type: 'string' },
                  type: { type: 'string' }
                },
                required: ['direction', 'type']
              }
            }
          }
        },
        responses: {
          200: { description: 'Job dequeued' },
          404: { description: 'No job available' },
          400: { description: 'Invalid request' }
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
          state: { type: 'string' },
          sourceUrl: { type: 'string' },
          resultUrl: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          startedAt: { type: 'string', nullable: true }
        },
        required: ['id', 'bookId', 'direction', 'type', 'state', 'createdAt', 'updatedAt']
      }
    }
  }
};

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve as any, swaggerUi.setup(swaggerDocument));
}
