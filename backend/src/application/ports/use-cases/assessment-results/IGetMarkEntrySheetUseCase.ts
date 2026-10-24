import { MarkEntrySheetDTO } from '@/application/dto/assessments/assessmentResultDtos';

export interface IGetMarkEntrySheetUseCase {
  execute(scheduleId: string): Promise<MarkEntrySheetDTO>;
}
