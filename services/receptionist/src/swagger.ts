import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Receptionist API',
    version: '1.0.0',
    description: 'API documentation for the Receptionist Service',
  },
  paths: {
    '/exports': {
      post: {
        summary: 'Submit an export job',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ExportJobRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Job created' },
          500: { description: 'Error' }
        }
      },
      get: {
        summary: 'List export jobs',
        responses: {
          200: { description: 'List of export jobs' },
          500: { description: 'Error' }
        }
      }
    },
    '/imports': {
      post: {
        summary: 'Submit an import job',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ImportJobRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Job created' },
          500: { description: 'Error' }
        }
      },
      get: {
        summary: 'List import jobs',
        responses: {
          200: { description: 'List of import jobs' },
          500: { description: 'Error' }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: { description: 'Service health' }
        }
      }
    }
  },
  components: {
    schemas: {
      ExportJobRequest: {
        type: 'object',
        properties: {
          bookId: { type: 'string' },
          type: { type: 'string', enum: ['epub', 'pdf'] }
        },
        required: ['bookId', 'type']
      },
      ImportJobRequest: {
        type: 'object',
        properties: {
          bookId: { type: 'string' },
          type: { type: 'string', enum: ['word', 'pdf', 'wattpad', 'evernote'] },
          url: { type: 'string', format: 'uri' }
        },
        required: ['bookId', 'type', 'url']
      },
      ExportJobResponse: {
        type: 'object',
        properties: { jobId: { type: 'string' } },
        required: ['jobId']
      },
      ImportJobResponse: {
        type: 'object',
        properties: { jobId: { type: 'string' } },
        required: ['jobId']
      }
    }
  }
};

export function setupSwagger(app: Express) {
  // @ts-ignore
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
