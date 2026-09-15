import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICenterRepository } from '../../../domain/repositories/ICenterRepository';
import { IUpdateCenterUseCase } from '../../ports/use-cases/centers/IUpdateCenterUseCase';
import { UpdateCenterDTO, CenterResponseDTO } from '../../dto/centers/centerDtos';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';

@injectable()
export class UpdateCenter implements IUpdateCenterUseCase {
  constructor(
    @inject(TYPES.CenterRepository)
    private readonly _centerRepository: ICenterRepository
  ) {}

  async execute(id: string, dto: UpdateCenterDTO): Promise<CenterResponseDTO> {
    const center = await this._centerRepository.findById(id);
    if (!center) {
      throw new NotFoundError(`Center with id "${id}" not found`);
    }

    if (dto.code && dto.code.trim().toUpperCase() !== center.code) {
      const existing = await this._centerRepository.findByCode(dto.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with code "${dto.code}" already exists`);
      }
    }

    if (dto.name && dto.name.trim().toLowerCase() !== center.name.toLowerCase()) {
      const existing = await this._centerRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with name "${dto.name}" already exists`);
      }
    }

    if (dto.email && dto.email.trim().toLowerCase() !== center.email.toLowerCase()) {
      const existing = await this._centerRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with email "${dto.email}" already exists`);
      }
    }

    if (dto.phone && dto.phone.trim() !== center.phone) {
      const existing = await this._centerRepository.findByPhone(dto.phone);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with phone "${dto.phone}" already exists`);
      }
    }

    const updatedAddress = dto.address
      ? {
          addressLine1: dto.address.addressLine1 || center.address.addressLine1,
          city: dto.address.city || center.address.city,
          state: dto.address.state || center.address.state,
          postalCode: dto.address.postalCode || center.address.postalCode,
          country: dto.address.country || center.address.country,
        }
      : undefined;

    center.updateDetails({
      name: dto.name,
      code: dto.code,
      phone: dto.phone,
      email: dto.email,
      timezone: dto.timezone,
      address: updatedAddress,
      status: dto.status,
    });

    const updated = await this._centerRepository.update(id, center);
    if (!updated) {
      throw new NotFoundError(`Center with id "${id}" could not be updated`);
    }

    return {
      id: updated.id!,
      name: updated.name,
      code: updated.code,
      phone: updated.phone,
      email: updated.email,
      timezone: updated.timezone,
      address: updated.address,
      status: updated.status,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }
}
