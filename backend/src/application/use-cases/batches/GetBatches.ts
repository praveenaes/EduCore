import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IBatchRepository, BatchFilters, BatchPagination } from '@/domain/repositories/IBatchRepository';
import { IGetBatchesUseCase } from '@/application/ports/use-cases/batches/IGetBatchesUseCase';
import { BatchListResultDTO } from '@/application/dto/batches/batchDtos';

@injectable()
export class GetBatches implements IGetBatchesUseCase {
  constructor(
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository
  ) {}

  async execute(filters: BatchFilters, pagination: BatchPagination): Promise<BatchListResultDTO> {
    const result = await this._batchRepo.findAll(filters, pagination);
    return {
      batches: result.batches.map((b) => ({
        id: b.id!,
        name: b.name,
        courseId: b.courseId,
        courseName: b.courseName,
        courseCode: b.courseCode,
        levelNumber: b.levelNumber,
        levelName: b.levelName,
        centerId: b.centerId,
        centerName: b.centerName,
        academicYearId: b.academicYearId,
        academicYearName: b.academicYearName,
        teacherId: b.teacherId,
        teacherName: b.teacherName,
        teacherEmployeeId: b.teacherEmployeeId,
        isActive: b.isActive,
        isDeleted: b.isDeleted,
        createdAt: b.createdAt?.toISOString(),
        updatedAt: b.updatedAt?.toISOString(),
      })),
      total: result.total,
    };
  }
}
