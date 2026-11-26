import { DeliveryChannel, NotificationTargetType } from '../enums/NotificationEnums';

export interface NotificationProps {
  id?: string;
  title: string;
  message: string;
  deliveryChannel: DeliveryChannel;
  targetType: NotificationTargetType;
  targetIds?: string[];
  createdBy: string;
  metadata?: {
    entityType?: 'homework' | 'assessment' | 'fee' | 'attendance' | 'general';
    entityId?: string;
    linkUrl?: string;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  creatorName?: string;
  creatorRole?: string;
}

export class Notification {
  private _props: NotificationProps;

  constructor(props: NotificationProps) {
    this._props = {
      ...props,
      targetIds: props.targetIds ? [...props.targetIds] : [],
      isActive: props.isActive ?? true,
      isDeleted: props.isDeleted ?? false,
    };
  }

  get id(): string | undefined { return this._props.id; }
  get title(): string { return this._props.title; }
  get message(): string { return this._props.message; }
  get deliveryChannel(): DeliveryChannel { return this._props.deliveryChannel; }
  get targetType(): NotificationTargetType { return this._props.targetType; }
  get targetIds(): string[] { return this._props.targetIds || []; }
  get createdBy(): string { return this._props.createdBy; }
  get metadata(): NotificationProps['metadata'] { return this._props.metadata; }
  get isActive(): boolean { return this._props.isActive; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }
  get creatorName(): string | undefined { return this._props.creatorName; }
  get creatorRole(): string | undefined { return this._props.creatorRole; }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.isActive = false;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    title: string;
    message: string;
    deliveryChannel?: DeliveryChannel;
    targetType: NotificationTargetType;
    targetIds?: string[];
    createdBy: string;
    metadata?: NotificationProps['metadata'];
  }): Notification {
    return new Notification({
      title: props.title.trim(),
      message: props.message.trim(),
      deliveryChannel: props.deliveryChannel || DeliveryChannel.IN_APP,
      targetType: props.targetType,
      targetIds: props.targetIds || [],
      createdBy: props.createdBy,
      metadata: props.metadata,
      isActive: true,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      message: this.message,
      deliveryChannel: this.deliveryChannel,
      targetType: this.targetType,
      targetIds: this.targetIds,
      createdBy: this.createdBy,
      metadata: this.metadata,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      creatorName: this.creatorName,
      creatorRole: this.creatorRole,
    };
  }
}
