import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "@/config/di/types";
import { AuthenticatedRequest } from "@/presentation/middleware/authMiddleware";
import { ResponseHelper } from "@/presentation/helpers/ResponseHelper";
import {
  createChatGroupSchema,
  sendChatMessageSchema,
  getMessagesQuerySchema,
  addMemberSchema,
} from "@/presentation/validators/chatValidators";
import { ICreateChatGroupUseCase } from "@/application/ports/use-cases/chat/ICreateChatGroupUseCase";
import { IGetUserChatGroupsUseCase } from "@/application/ports/use-cases/chat/IGetUserChatGroupsUseCase";
import { IGetChatGroupMessagesUseCase } from "@/application/ports/use-cases/chat/IGetChatGroupMessagesUseCase";
import { ISendChatMessageUseCase } from "@/application/ports/use-cases/chat/ISendChatMessageUseCase";
import { IAddGroupMemberUseCase } from "@/application/ports/use-cases/chat/IAddGroupMemberUseCase";
import { IRemoveGroupMemberUseCase } from "@/application/ports/use-cases/chat/IRemoveGroupMemberUseCase";
import { IClearGroupMessagesUseCase } from "@/application/ports/use-cases/chat/IClearGroupMessagesUseCase";
import { IGetOrCreateAiChatGroupUseCase } from "@/application/ports/use-cases/chat/IGetOrCreateAiChatGroupUseCase";
import { IGetCandidateMembersUseCase } from "@/application/ports/use-cases/chat/IGetCandidateMembersUseCase";
import { ValidationError } from "@/shared/errors/AppError";

@injectable()
export class ChatController {
  constructor(
    @inject(TYPES.CreateChatGroupUseCase)
    private _createChatGroupUseCase: ICreateChatGroupUseCase,
    @inject(TYPES.GetUserChatGroupsUseCase)
    private _getUserChatGroupsUseCase: IGetUserChatGroupsUseCase,
    @inject(TYPES.GetChatGroupMessagesUseCase)
    private _getChatGroupMessagesUseCase: IGetChatGroupMessagesUseCase,
    @inject(TYPES.SendChatMessageUseCase)
    private _sendChatMessageUseCase: ISendChatMessageUseCase,
    @inject(TYPES.AddGroupMemberUseCase)
    private _addGroupMemberUseCase: IAddGroupMemberUseCase,
    @inject(TYPES.RemoveGroupMemberUseCase)
    private _removeGroupMemberUseCase: IRemoveGroupMemberUseCase,
    @inject(TYPES.ClearGroupMessagesUseCase)
    private _clearGroupMessagesUseCase: IClearGroupMessagesUseCase,
    @inject(TYPES.GetOrCreateAiChatGroupUseCase)
    private _getOrCreateAiChatGroupUseCase: IGetOrCreateAiChatGroupUseCase,
    @inject(TYPES.GetCandidateMembersUseCase)
    private _getCandidateMembersUseCase: IGetCandidateMembersUseCase
  ) {}

  createGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = createChatGroupSchema.parse(req.body);
     
    const result = await this._createChatGroupUseCase.execute({
      ...validated,
      createdBy: req.user!.id,
    });
    ResponseHelper.created(res, "Chat group created successfully", result);
  };

  getMyGroups = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this._getUserChatGroupsUseCase.execute(req.user!.id);
    ResponseHelper.success(res, "Chat groups retrieved successfully", result);
  };

  getGroupMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = getMessagesQuerySchema.parse(req.query);
    const result = await this._getChatGroupMessagesUseCase.execute(
      req.params.groupId,
      req.user!.id,
      { page: query.page, limit: query.limit }
    );
    ResponseHelper.success(res, "Messages retrieved successfully", result);
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = sendChatMessageSchema.parse(req.body);

    const result = await this._sendChatMessageUseCase.execute({
      groupId: req.params.groupId,
      senderId: req.user!.id,
      userRole: req.user!.role,
      message: validated.message,
      messageType: validated.messageType,
      attachmentUrl: validated.attachmentUrl,
      attachmentName: validated.attachmentName,
      attachmentSize: validated.attachmentSize,
    });

    ResponseHelper.created(res, "Message sent successfully", result);
  };

  addMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = addMemberSchema.parse(req.body);
    const result = await this._addGroupMemberUseCase.execute({
      groupId: req.params.groupId,
      userId: validated.userId,
      userIds: validated.userIds,
      role: validated.role,
      requestedBy: req.user!.id,
    });
    ResponseHelper.success(res, "Member added successfully", result);
  };

  removeMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this._removeGroupMemberUseCase.execute({
      groupId: req.params.groupId,
      userId: req.params.userId,
      requestedBy: req.user!.id,
    });
    ResponseHelper.success(res, "Member removed successfully", result);
  };

  clearGroupMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this._clearGroupMessagesUseCase.execute({
      groupId: req.params.groupId,
      requestedBy: req.user!.id,
    });
    ResponseHelper.success(res, "Chat cleared successfully", result);
  };

  getOrCreateAiGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this._getOrCreateAiChatGroupUseCase.execute(
      req.user!.id,
      req.user!.role
    );
    ResponseHelper.success(res, "AI chat group ready", result);
  };

  getCandidateMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this._getCandidateMembersUseCase.execute(
      req.user!.id,
      req.user!.role
    );
    ResponseHelper.success(res, "Candidate members retrieved successfully", result);
  };
}