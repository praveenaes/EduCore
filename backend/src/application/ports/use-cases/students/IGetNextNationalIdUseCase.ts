export interface IGetNextNationalIdUseCase {
  execute(): Promise<string>;
}
