import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";
import logger from "../logger";

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.info("Validating request body", { body: req.body });

    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        logger.warn("Zod validation failed", { issues });

        res.status(400).json({
          error: "Validation failed",
          details: issues,
        });
      } else {
        logger.error("Unexpected validation middleware error", { error });
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}
