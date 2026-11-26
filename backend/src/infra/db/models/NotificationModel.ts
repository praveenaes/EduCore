import mongoose, { Schema, Document, Types } from 'mongoose';
import { DeliveryChannel, NotificationTargetType } from '../../../domain/enums/NotificationEnums';

export interface INotificationDocument extends Document {
  title: string;
  message: string;
  deliveryChannel: DeliveryChannel;
  targetType: NotificationTargetType;
  targetIds: string[];
  createdBy: Types.ObjectId;
  metadata?: {
    entityType?: 'homework' | 'assessment' | 'fee' | 'attendance' | 'general';
    entityId?: string;
    linkUrl?: string;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    deliveryChannel: {
      type: String,
      enum: Object.values(DeliveryChannel),
      default: DeliveryChannel.IN_APP,
    },
    targetType: {
      type: String,
      enum: Object.values(NotificationTargetType),
      required: true,
    },
    targetIds: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: {
      entityType: { type: String },
      entityId: { type: String },
      linkUrl: { type: String },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ createdBy: 1, createdAt: -1 });
NotificationSchema.index({ targetType: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema
);
