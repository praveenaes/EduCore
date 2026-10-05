import { TeacherBatchListResultDTO } from '@/application/dto/teachers/teacherBatchDtos';
import { TeacherBatchFilters } from '@/domain/repositories/ITeacherRepository';
import { BatchPagination } from '@/domain/repositories/IBatchRepository';

export interface IGetTeacherBatches {
  execute(
    filters: TeacherBatchFilters,
    pagination: BatchPagination
  ): Promise<TeacherBatchListResultDTO>;
}
