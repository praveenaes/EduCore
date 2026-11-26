import mongoose, { Schema, Document, Types } from 'mongoose';
import { NotificationStatus } from '../../../domain/enums/NotificationEnums';

export interface INotificationRecipientDocument extends Document {
  notificationId: Types.ObjectId;
  userId: Types.ObjectId;
  status: NotificationStatus;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationRecipientSchema = new Schema<INotificationRecipientDocument>(
  {
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

NotificationRecipientSchema.index(
  { notificationId: 1, userId: 1 },
  { unique: true }
);
NotificationRecipientSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const NotificationRecipientModel = mongoose.model<INotificationRecipientDocument>(
  'NotificationRecipient',
  NotificationRecipientSchema
);
