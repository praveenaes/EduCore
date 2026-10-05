import { ErrorRequestHandler } from "express";
import { AppError, ValidationError } from "@/shared/errors/AppError";
import { z, ZodError } from "zod";
import {logger} from '@/infra/logger/logger'

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  req.resume();

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: err.errors[0]?.message || "Validation failed",
      errors: err.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join("."),
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    logger.warn(err.message, {
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
    });
    let errors = undefined;
    if (err instanceof ValidationError) {
      errors = err.errors;
      if (!errors) {
        const msg = err.message;
        if (msg.includes("Admission Number")) {
          errors = [{ field: "admissionNumber", message: msg }];
        } else if (msg.includes("National ID")) {
          errors = [{ field: "nationalId", message: msg }];
        } else if (msg.includes("Email")) {
          errors = [{ field: "email", message: msg }];
        } else if (msg.includes("name")) {
          errors = [
            { field: "firstName", message: msg },
            { field: "lastName", message: msg }
          ];
        }
      }
    }
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      message: err.message,
      errors,
    });
  }

  // Handle payload too large (e.g. large PDF/document uploads)
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      error: 'Uploaded file is too large. Please upload files under 50MB.',
      message: 'Uploaded file is too large. Please upload files under 50MB.',
    });
  }

  console.error("UNHANDLED ERROR:", err);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Internal Server Error",
  });

  next();
};
