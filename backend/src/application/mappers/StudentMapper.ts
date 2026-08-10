import { Student } from "../../domain/entities/Student";
import { IStudentDocument } from "../../infra/db/models/StudentModel";

//mapper converts 1 format of data to another
//Whenever data is coming from MongoDB.
export class StudentMapper {
  static toDomain(doc: IStudentDocument): Student {
    return new Student(
      doc._id.toString(),
      doc.firstName,
      doc.lastName,
      doc.admissionNumber,
      doc.admissionDate,
      doc.gender,
      doc.dateOfBirth,
      doc.bloodGroup,
      doc.nationalId,
      doc.photo,
      doc.phone,
      doc.email,
      doc.house,
      doc.area,
      doc.city,
      doc.state,
      doc.postalCode,
      doc.country,
      doc.isDeleted,
      doc.isActive,
      doc.userId.toString(),
      doc.createdAt,
      doc.updatedAt
    );
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

    return updateData;
  }
}

//if we are not using static, every time to convert data we have to create object
//like const mapper=new studentMapper()
//mapper.toDomain(doc)
//now we can simply call studentMapper.toDomain(doc)
