import { Response } from "express";
import { ApiResponse } from "./ApiResponse";

export class ResponseHelper {
  /**
   * Standard success response wrapper: { success: true, message, data }
   */
  static success<T>(
    res: Response,//Express response object
    message: string = "Success",
    data: T | null = null,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    res.status(statusCode).json(response);
  }

  /**
   * Standard created response wrapper: { success: true, message, data }
   */
  static created<T>(
    res: Response,
    message: string = "Created",
    data: T | null = null
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    res.status(201).json(response);
  }
}
