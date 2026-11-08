export interface ProcessFeeWebhookDTO {
  rawBody: string | Buffer;
  signature: string;
  payload: any;
}

export interface ProcessFeeWebhookResponseDTO {
  success: boolean;
  message: string;
}

export interface IProcessFeeWebhookUseCase {
  execute(dto: ProcessFeeWebhookDTO): Promise<ProcessFeeWebhookResponseDTO>;
}
