import "reflect-metadata"; // Required for Inversify
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ENV } from "@/config/env.config";
import routes from "@/infra/web/express/routes/index";
import { logger, morganMiddleware } from "@/infra/logger/logger";
import { globalErrorHandler } from "@/infra/web/express/middleware/globalErrorHandler";

const app = express();

//Allows your frontend to communicate with your backend.
//Without CORS, the browser blocks requests between different origins.
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());//Converts JSON request bodies into JavaScript objects.
app.use(cookieParser());//Reads cookies sent by the browser.
app.use(morganMiddleware);//Logs every HTTP request.

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api", routes);

// Global Error Handler
app.use(globalErrorHandler);//Catches errors from anywhere in the application.

// Database connection & Server Boot
const bootstrap = async () => {
  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(ENV.MONGODB_URI);
    logger.info("MongoDB connected successfully.");

    const port = ENV.PORT;
    app.listen(port, () => {
      logger.info(`Server is running in ${ENV.NODE_ENV} mode on port ${port}`);
    });
  } catch (error) {
    logger.error("Bootstrapping failed:", { error });
    process.exit(1);
  }
};

bootstrap();
