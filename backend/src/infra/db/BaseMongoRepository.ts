import { Model,FilterQuery, UpdateQuery  } from "mongoose";
import { injectable } from "inversify";
import { IBaseRepository } from "../../domain/repositories/IBaseRepository";

export interface IMapper<TDomain, TDoc> {
  toDomain(doc: TDoc): TDomain;
  toPersistence(entity: TDomain): object;
  toPersistencePartial(entity: Partial<TDomain>): object;
}

@injectable()
export abstract class BaseMongoRepository<TDomain, TDoc> implements IBaseRepository<TDomain> {
  protected abstract readonly _model: Model<TDoc>;
  protected abstract readonly _mapper: IMapper<TDomain, TDoc>;

  async create(entity: TDomain): Promise<TDomain> {
    const doc = new this._model(this._mapper.toPersistence(entity));
    await doc.save();
    return this._mapper.toDomain(doc as unknown as TDoc);
  }

  async findById(id: string): Promise<TDomain | null> {
    const doc = await this._model.findOne({ _id: id, isDeleted: { $ne: true } } as FilterQuery<TDoc>);
    if (!doc) return null;
    return this._mapper.toDomain(doc as unknown as TDoc);
  }

  async update(id: string, entity: Partial<TDomain>): Promise<TDomain | null> {
    const updateData = this._mapper.toPersistencePartial(entity);
    const doc = await this._model.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } } as FilterQuery<TDoc>,
      { $set: updateData } as UpdateQuery<TDoc>,
      { new: true }
    );
    if (!doc) return null;
    return this._mapper.toDomain(doc as unknown as TDoc);
  }
}

// abstract: Marks this class as an abstract blueprint. You cannot create new 
// BaseMongoRepository() directly; it can only be extended by child classes.

//protected: Only accessible inside this base class and its subclasses 
// (hidden from outside callers).
// abstract: Forces every child subclass (MongoStudentRepository, MongoTeacherRepository) 
// to supply its own specific Mongoose model (StudentModel, TeacherModel).
//readonly: Prevents accidental reassignment after initialization