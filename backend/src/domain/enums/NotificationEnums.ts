export enum DeliveryChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum NotificationTargetType {
  ALL = 'ALL',
  CENTER = 'CENTER',
  COURSE = 'COURSE',
  BATCH = 'BATCH',
  USER = 'USER',
}
