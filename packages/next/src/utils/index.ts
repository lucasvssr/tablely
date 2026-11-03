import { z } from 'zod';

export const zodParseFactory =
  <Schema extends z.ZodType>(schema: Schema) =>
  (data: unknown): z.output<Schema> => {
    try {
      return schema.parse(data) as z.output<Schema>;
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Invalid data: ${message}`, {
        cause: error,
      });
    }
  };