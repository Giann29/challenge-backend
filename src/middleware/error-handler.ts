import { Request, Response, NextFunction } from "express";
import { BaseException } from "../domain/exceptions/base-exception";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${error.stack}`);

  if (error instanceof BaseException) {
    return res.status(error.statusCode).json({
      status: "error",
      code: error.errorCode,
      message: error.message,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: error.message,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  if (
    error.message ===
    "Forbidden: You do not have permission to access this resource."
  ) {
    return res.status(403).json({
      status: "error",
      code: "FORBIDDEN",
      message: error.message,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "error",
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.url}`,
    path: req.url,
    timestamp: new Date().toISOString(),
  });
};
