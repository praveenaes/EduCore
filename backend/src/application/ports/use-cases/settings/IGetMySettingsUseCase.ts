export interface IGetMySettings {
  execute(userId: string, role: string): Promise<any>;
}
