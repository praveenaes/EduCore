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
    private _centerRepository: ICenterRepository
  ) {}

  async execute(id: string, dto: UpdateCenterDTO): Promise<CenterResponseDTO> {
    const center = await this._centerRepository.findById(id);
    if (!center) {
      throw new NotFoundError(`Center with id "${id}" not found`);
    }

    const { name, code, phone, email, timezone, address, status, programs } = dto;
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (trimmedCode !== center.code) {
      const existing = await this._centerRepository.findByCode(trimmedCode);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with code "${trimmedCode}" already exists`);
      }
    }

    if (trimmedName.toLowerCase() !== center.name.toLowerCase()) {
      const existing = await this._centerRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with name "${trimmedName}" already exists`);
      }
    }

    if (trimmedEmail !== center.email.toLowerCase()) {
      const existing = await this._centerRepository.findByEmail(trimmedEmail);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with email "${trimmedEmail}" already exists`);
      }
    }

    if (trimmedPhone !== center.phone) {
      const existing = await this._centerRepository.findByPhone(trimmedPhone);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Center with phone "${trimmedPhone}" already exists`);
      }
    }

    center.updateDetails({
      name: trimmedName,
      code: trimmedCode,
      phone: trimmedPhone,
      email: trimmedEmail,
      timezone: timezone.trim(),
      address: {
        addressLine1: address.addressLine1.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country.trim(),
      },
      status,
      programs,
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
      programs: updated.programs,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }
}
