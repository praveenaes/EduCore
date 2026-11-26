import mongoose, { Schema, Document, Types } from 'mongoose';
import { ChatGroupType, ChatMemberRole, ChatMessageType } from '../../../domain/enums/ChatEnums';

export interface IChatMemberSubdocument {
  userId: Types.ObjectId;
  role: ChatMemberRole;
  joinedAt: Date;
  leftAt?: Date | null;
  leftReason?: 'LEFT' | 'REMOVED' | null;
}

export interface IChatLastMessageSubdocument {
  message: string;
  senderId: Types.ObjectId;
  senderName?: string;
  sentAt: Date;
  messageType: ChatMessageType;
}

export interface IChatGroupDocument extends Document {
  name: string;
  description?: string;
  groupType: ChatGroupType;
  isAdminOnly: boolean;
  createdBy: Types.ObjectId;
  members: IChatMemberSubdocument[];
  lastMessage?: IChatLastMessageSubdocument;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMemberSchema = new Schema<IChatMemberSubdocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: Object.values(ChatMemberRole),
      default: ChatMemberRole.MEMBER,
    },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
    leftReason: { type: String, enum: ['LEFT', 'REMOVED'], default: null },
  },
  { _id: false }
);

const ChatLastMessageSchema = new Schema<IChatLastMessageSubdocument>(
  {
    message: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    sentAt: { type: Date, default: Date.now },
    messageType: {
      type: String,
      enum: Object.values(ChatMessageType),
      default: ChatMessageType.TEXT,
    },
  },
  { _id: false }
);

const ChatGroupSchema = new Schema<IChatGroupDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    groupType: {
      type: String,
      enum: Object.values(ChatGroupType),
      default: ChatGroupType.CUSTOM,
    },
    isAdminOnly: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [ChatMemberSchema],
    lastMessage: ChatLastMessageSchema,
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChatGroupSchema.index({ 'members.userId': 1, 'members.leftAt': 1 });
ChatGroupSchema.index({ groupType: 1, createdBy: 1 });
ChatGroupSchema.index({ updatedAt: -1 });

export const ChatGroupModel = mongoose.model<IChatGroupDocument>('ChatGroup', ChatGroupSchema);