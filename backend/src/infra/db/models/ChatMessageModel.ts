import mongoose, { Schema, Document, Types } from 'mongoose';
import { ChatMessageType } from '../../../domain/enums/ChatEnums';

export interface IChatMessageDocument extends Document {
  groupId: Types.ObjectId;
  senderId?: Types.ObjectId;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
  message: string;
  messageType: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isAi: boolean;
  aiPrompt?: string;
  readBy: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'ChatGroup', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    senderRole: { type: String },
    senderAvatar: { type: String },
    message: { type: String, required: true },
    messageType: {
      type: String,
      enum: Object.values(ChatMessageType),
      default: ChatMessageType.TEXT,
    },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    attachmentSize: { type: Number },
    isAi: { type: Boolean, default: false },
    aiPrompt: { type: String },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ groupId: 1, createdAt: -1 });
ChatMessageSchema.index({ groupId: 1, isDeleted: 1 });

export const ChatMessageModel = mongoose.model<IChatMessageDocument>('ChatMessage', ChatMessageSchema);