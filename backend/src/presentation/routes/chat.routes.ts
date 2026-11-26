import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { ChatController } from "@/presentation/controllers/chat/Chat.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getChatRoutes = (container: Container): Router => {
  const router = Router();
  const chatController = container.get<ChatController>(TYPES.ChatController);

  router.use(authenticateUser);

  router
    .route(API_ROUTES.CHAT.CANDIDATE_MEMBERS)
    .get(asyncHandler(chatController.getCandidateMembers.bind(chatController)));

  router
    .route(API_ROUTES.CHAT.GROUPS)
    .get(asyncHandler(chatController.getMyGroups.bind(chatController)))
    .post(asyncHandler(chatController.createGroup.bind(chatController)));

  router
    .route(API_ROUTES.CHAT.AI_TUTOR)
    .post(asyncHandler(chatController.getOrCreateAiGroup.bind(chatController)));

  router
    .route(API_ROUTES.CHAT.GROUP_MESSAGES)
    .get(asyncHandler(chatController.getGroupMessages.bind(chatController)))
    .post(asyncHandler(chatController.sendMessage.bind(chatController)))
    .delete(asyncHandler(chatController.clearGroupMessages.bind(chatController)));

  router
    .route(API_ROUTES.CHAT.GROUP_MEMBERS)
    .post(asyncHandler(chatController.addMember.bind(chatController)));

  router
    .route(API_ROUTES.CHAT.GROUP_MEMBER_DETAIL)
    .delete(asyncHandler(chatController.removeMember.bind(chatController)));

  return router;
};