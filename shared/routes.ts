import { z } from 'zod';
import { insertTrackSchema, tracks } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tracks: {
    list: {
      method: 'GET' as const,
      path: '/api/tracks',
      responses: {
        200: z.array(z.custom<typeof tracks.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tracks/:id',
      responses: {
        200: z.custom<typeof tracks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // We'll handle the upload via a standard form submit or a specialized endpoint
    // that returns the track object. The input is technically multipart/form-data
    // but for the schema we'll just validate the response.
    create: {
      method: 'POST' as const,
      path: '/api/tracks',
      responses: {
        201: z.custom<typeof tracks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tracks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
