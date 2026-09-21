import { Types } from "mongoose";
import { Student } from "../../domain/entities/Student";

//mapper converts 1 format of data to another
export interface IStudentPersistenceInput {
  _id: Types.ObjectId |string
  firstName: string;
  lastName: string;
  admissionNumber: string;
  admissionDate: Date;
  gender: string;
  dateOfBirth: Date;
  bloodGroup: string;
  nationalId: string;
  photo: string;
  phone: string;
  email: string;
  house: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  batchId: Types.ObjectId | string | { _id: Types.ObjectId | string; name: string };
  isDeleted: boolean;
  isActive: boolean;
  userId: Types.ObjectId|string
  createdAt?: Date;
  updatedAt?: Date;
}

//Whenever data is coming from MongoDB.
export class StudentMapper {
  static toDomain(doc: IStudentPersistenceInput): Student {
    let batchId = "";
    let batchName: string | undefined;

    if (doc.batchId) {
      if (typeof doc.batchId === "object" && "name" in doc.batchId) {
        batchId = (doc.batchId as any)._id?.toString() || (doc.batchId as any).id?.toString() || "";
        batchName = (doc.batchId as any).name;
      } else {
        batchId = doc.batchId.toString();
      }
    }

    return new Student({
      id: doc._id.toString(),
      firstName: doc.firstName,
      lastName: doc.lastName,
      admissionNumber: doc.admissionNumber,
      admissionDate: doc.admissionDate,
      gender: doc.gender,
      dateOfBirth: doc.dateOfBirth,
      bloodGroup: doc.bloodGroup,
      nationalId: doc.nationalId,
      photo: doc.photo,
      phone: doc.phone,
      email: doc.email,
      house: doc.house,
      area: doc.area,
      city: doc.city,
      state: doc.state,
      postalCode: doc.postalCode,
      country: doc.country,
      batchId,
      batchName,
      isDeleted: doc.isDeleted,
      isActive: doc.isActive,
      userId: doc.userId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  // Whenever we want to save a new student into MongoDB.
  static toPersistence(student: Student): {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    admissionDate: Date;
    gender: string;
    dateOfBirth: Date;
    bloodGroup: string;
    nationalId: string;
    photo: string;
    phone: string;
    email: string;
    house: string;
    area: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    batchId: string;
    isDeleted: boolean;
    isActive: boolean;
    userId: string;
  } {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      admissionDate: student.admissionDate,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup,
      nationalId: student.nationalId,
      photo: student.photo,
      phone: student.phone,
      email: student.email,
      house: student.house,
      area: student.area,
      city: student.city,
      state: student.state,
      postalCode: student.postalCode,
      country: student.country,
      batchId: student.batchId,
      isDeleted: student.isDeleted,
      isActive: student.isActive,
      userId: student.userId,
    };
  }

  //Whenever we want to update an existing student.
  //partial makes it optional
  static toPersistencePartial(student: Partial<Student>): {
    firstName?: string;
    lastName?: string;
    admissionDate?: Date;
    gender?: string;
    dateOfBirth?: Date;
    bloodGroup?: string;
    nationalId?: string;
    photo?: string;
    phone?: string;
    email?: string;
    house?: string;
    area?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    batchId?: string;
    isActive?: boolean;
    isDeleted?: boolean;
  } {
    const updateData: {
      firstName?: string;
      lastName?: string;
      admissionDate?: Date;
      gender?: string;
      dateOfBirth?: Date;
      bloodGroup?: string;
      nationalId?: string;
      photo?: string;
      phone?: string;
      email?: string;
      house?: string;
      area?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      batchId?: string;
      isActive?: boolean;
      isDeleted?: boolean;
    } = {};

    if (student.firstName !== undefined) updateData.firstName = student.firstName;
    if (student.lastName !== undefined) updateData.lastName = student.lastName;
    if (student.admissionDate !== undefined) updateData.admissionDate = student.admissionDate;
    if (student.gender !== undefined) updateData.gender = student.gender;
    if (student.dateOfBirth !== undefined) updateData.dateOfBirth = student.dateOfBirth;
    if (student.bloodGroup !== undefined) updateData.bloodGroup = student.bloodGroup;
    if (student.nationalId !== undefined) updateData.nationalId = student.nationalId;
    if (student.photo !== undefined) updateData.photo = student.photo;
    if (student.phone !== undefined) updateData.phone = student.phone;
    if (student.email !== undefined) updateData.email = student.email;
    if (student.house !== undefined) updateData.house = student.house;
    if (student.area !== undefined) updateData.area = student.area;
    if (student.city !== undefined) updateData.city = student.city;
    if (student.state !== undefined) updateData.state = student.state;
    if (student.postalCode !== undefined) updateData.postalCode = student.postalCode;
    if (student.country !== undefined) updateData.country = student.country;
    if (student.batchId !== undefined) updateData.batchId = student.batchId;
    if (student.isActive !== undefined) updateData.isActive = student.isActive;
    if (student.isDeleted !== undefined) updateData.isDeleted = student.isDeleted;

    return updateData;
  }
}

//if we are not using static, every time to convert data we have to create object
//like const mapper=new studentMapper()
//mapper.toDomain(doc)
//now we can simply call studentMapper.toDomain(doc)
