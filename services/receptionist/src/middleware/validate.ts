import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import logger from "../logger";

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.info("Validating request", { body: req.body });
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const zodError = error as { errors?: Array<{ message: string }> };
      logger.error("Validation error", { error });
      res.status(400).json({ error: zodError.errors?.[0]?.message || 'Validation failed' });
    }
  };
}
