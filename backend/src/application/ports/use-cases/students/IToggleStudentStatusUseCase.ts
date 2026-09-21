export interface ToggleStatusRequest {
  id: string;
  isActive: boolean;
}

export interface IToggleStudentStatus {
  execute(req: ToggleStatusRequest): Promise<{ id: string; isActive: boolean }>;
}
