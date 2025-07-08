import { Request, Response, NextFunction, RequestHandler } from "express";
import logger from "../logger";

export function validate(schema: any): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.info("Validating request", { body: req.body });
    const { error } = schema.validate(req.body);
    if (error) {
      logger.error("Validation error", { error });
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    next();
  };
}
