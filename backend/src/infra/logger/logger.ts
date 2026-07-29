import winston from "winston";
import morgan from "morgan";
import DailyRotateFile from "winston-daily-rotate-file";
import { ENV } from "@/config/env.config";



const LOG_LEVEL = ENV.NODE_ENV === "production" ? "info" : "debug";


const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString =
      Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : "";
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  }),
);
//null → don't filter any keys

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),//Stack trace
  winston.format.json(),
);

const errorRotateTransport = new DailyRotateFile({//Creates daily error logs.
  dirname: "logs",
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});


//Stores ALL logs.
const combinedRotateTransport = new DailyRotateFile({
  dirname: "logs",
  filename: "combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "7d",
});

//Creates global logger instance.
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: fileFormat,
  defaultMeta: {//Every log automatically gets:
    service: "educore-backend",
    env: ENV.NODE_ENV,
  },
  transports: [errorRotateTransport, combinedRotateTransport],//Send logs to:
  exceptionHandlers: [
    new DailyRotateFile({//Captures uncaught exceptions if no try cartch
      dirname: "logs",
      filename: "exceptions-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
  rejectionHandlers: [ //Captures unhandled Promise rejections.
    new DailyRotateFile({
      dirname: "logs",
      filename: "rejections-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
});

if (ENV.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

export const morganMiddleware = morgan(
  (tokens, req, res) =>
    JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTime: `${tokens["response-time"](req, res)} ms`,//53 ms
    }),
  {
    stream: {
      write: (message: string) => {
        logger.http("HTTP Request", JSON.parse(message));
      },
    },
  },
);

//Morgan gathers the request information; Winston is the engine that outputs and stores it.

