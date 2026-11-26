import "reflect-metadata";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import { ENV } from "@/config/env.config";
import routes from "@/presentation/routes/index";
import { logger, morganMiddleware } from "@/infra/logger/logger";
import { globalErrorHandler } from "@/presentation/middleware/globalErrorHandler";
import { container } from "@/config/di/container";
import { TYPES } from "@/config/di/types";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { SocketNotificationService } from "@/infra/services/SocketNotificationService";
import { SocketChatService } from "@/infra/services/SocketChatService";

const app = express();

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: '50mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(morganMiddleware);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api", routes);
app.use(globalErrorHandler);

const httpServer = http.createServer(app);

//Socket.IO server instance
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [ENV.CLIENT_URL || "http://localhost:5173", "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

//socket authentication
io.use((socket, next) => {
  let token =
    (socket.handshake.auth?.token as string) ||
    (socket.handshake.query?.token as string) ||
    (socket.handshake.headers?.authorization as string);

  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const authService = container.get<IAuthService>(TYPES.AuthService);
    const payload = authService.verifyToken(token);
    if (!payload) {
      return next(new Error("Invalid token"));
    }
    socket.data.user = payload;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

//after client successfully connects to the Socket.IO server
io.on("connection", (socket) => {
  const userId = socket.data.user?.userId;//personal room
  if (userId) {
    socket.join(`user:${userId}`);
    logger.info(`Notification socket connected for user: ${userId}`);
  }

  socket.on("chat:join", (groupId: string) => {
    if (groupId) {
      socket.join(`chat:group:${groupId}`);
    }
  });

  socket.on("chat:leave", (groupId: string) => {//remove their socket connection
    if (groupId) {
      socket.leave(`chat:group:${groupId}`);
    }
  });

  socket.on("chat:typing", (data: { groupId: string; isTyping: boolean }) => {//broadcasts the typing statu
    if (data?.groupId && userId) {
      socket.to(`chat:group:${data.groupId}`).emit("chat:typing", {
        groupId: data.groupId,
        userId,
        isTyping: data.isTyping
      });
    }
  });
});

SocketNotificationService.setServer(io);
SocketChatService.setServer(io);

const bootstrap = async () => {
  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(ENV.MONGODB_URI || "");
    logger.info("MongoDB connected successfully.");

    const port = ENV.PORT;
    httpServer.listen(port, () => {
      logger.info(`Server is running in ${ENV.NODE_ENV} mode on port ${port}`);
    });
  } catch (error) {
    logger.error("Bootstrapping failed:", { error });
    process.exit(1);
  }
};

bootstrap();
