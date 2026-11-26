export interface IGetNextAdmissionNumberUseCase {
  execute(): Promise<string>;
}
