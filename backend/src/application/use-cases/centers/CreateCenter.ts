import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICenterRepository } from '../../../domain/repositories/ICenterRepository';
import { ICreateCenterUseCase } from '../../ports/use-cases/centers/ICreateCenterUseCase';
import { CreateCenterDTO, CenterResponseDTO } from '../../dto/centers/centerDtos';
import { Center } from '../../../domain/entities/Center';
import { ConflictError } from '@/shared/errors/AppError';

@injectable()
export class CreateCenter implements ICreateCenterUseCase {
  constructor(
    @inject(TYPES.CenterRepository)
    private _centerRepository: ICenterRepository
  ) {}

  async execute(dto: CreateCenterDTO): Promise<CenterResponseDTO> {
    const existingCode = await this._centerRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictError(`Center with code "${dto.code}" already exists`);
    }

    const existingName = await this._centerRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictError(`Center with name "${dto.name}" already exists`);
    }

    const existingEmail = await this._centerRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError(`Center with email "${dto.email}" already exists`);
    }

    const existingPhone = await this._centerRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ConflictError(`Center with phone "${dto.phone}" already exists`);
    }

    const center = new Center({
      name: dto.name,
      code: dto.code,
      phone: dto.phone,
      email: dto.email,
      timezone: dto.timezone,
      address: dto.address,
      status: dto.status || 'active',
    });

    const saved = await this._centerRepository.create(center);

    return {
      id: saved.id!,
      name: saved.name,
      code: saved.code,
      phone: saved.phone,
      email: saved.email,
      timezone: saved.timezone,
      address: saved.address,
      status: saved.status,
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    };
  }
}
