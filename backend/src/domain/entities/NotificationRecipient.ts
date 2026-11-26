import { NotificationStatus } from '../enums/NotificationEnums';

export interface NotificationRecipientProps {
  id?: string;
  notificationId: string;
  userId: string;
  status: NotificationStatus;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  notificationTitle?: string;
  notificationMessage?: string;
  notificationCreatedAt?: Date;
  createdBy?: string;
  creatorName?: string;
  metadata?: {
    entityType?: string;
    entityId?: string;
    linkUrl?: string;
  };
}

export class NotificationRecipient {
  private _props: NotificationRecipientProps;

  constructor(props: NotificationRecipientProps) {
    this._props = {
      ...props,
      status: props.status || NotificationStatus.PENDING,
    };
  }

  get id(): string | undefined { return this._props.id; }
  get notificationId(): string { return this._props.notificationId; }
  get userId(): string { return this._props.userId; }
  get status(): NotificationStatus { return this._props.status; }
  get readAt(): Date | null | undefined { return this._props.readAt; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }
  get notificationTitle(): string | undefined { return this._props.notificationTitle; }
  get notificationMessage(): string | undefined { return this._props.notificationMessage; }
  get notificationCreatedAt(): Date | undefined { return this._props.notificationCreatedAt; }
  get createdBy(): string | undefined { return this._props.createdBy; }
  get creatorName(): string | undefined { return this._props.creatorName; }
  get metadata(): NotificationRecipientProps['metadata'] { return this._props.metadata; }

  markAsRead(): void {
    if (this._props.status !== NotificationStatus.READ) {
      this._props.status = NotificationStatus.READ;
      this._props.readAt = new Date();
      this._props.updatedAt = new Date();
    }
  }

  static createNew(props: {
    notificationId: string;
    userId: string;
    status?: NotificationStatus;
  }): NotificationRecipient {
    return new NotificationRecipient({
      notificationId: props.notificationId,
      userId: props.userId,
      status: props.status || NotificationStatus.PENDING,
    });
  }

  toJSON() {
    return {
      id: this.id,
      notificationId: this.notificationId,
      userId: this.userId,
      status: this.status,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      notificationTitle: this.notificationTitle,
      notificationMessage: this.notificationMessage,
      notificationCreatedAt: this.notificationCreatedAt,
      createdBy: this.createdBy,
      creatorName: this.creatorName,
      metadata: this.metadata,
    };
  }
}
