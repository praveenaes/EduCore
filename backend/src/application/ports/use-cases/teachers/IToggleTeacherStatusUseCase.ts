export interface ToggleTeacherStatusRequest {
  id: string;
  isActive: boolean;
}

export interface IToggleTeacherStatus {
  execute(req: ToggleTeacherStatusRequest): Promise<{ id: string; isActive: boolean }>;
}
