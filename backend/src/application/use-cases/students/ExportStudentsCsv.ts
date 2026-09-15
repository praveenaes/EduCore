import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";

import { IExportStudentsCsv } from "../../ports/use-cases/students/IExportStudentsCsvUseCase";

export interface ExportStudentsRequest {
  search?: string;
}

@injectable()
export class ExportStudentsCsv implements IExportStudentsCsv {
  constructor(
    @inject(TYPES.StudentRepository) private studentRepository: IStudentRepository
  ) {}

  private escapeCsvValue(value:unknown): string {
    const str = value == null ? "" : String(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  async execute(req: ExportStudentsRequest): Promise<string> {
    const students = await this.studentRepository.exportAll({ search: req.search?.trim() });

    const headers = [
      'Admission Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Gender',
      'Date of Birth',
      'Blood Group',
      'Admission Date',
      'National ID',
      'House',
      'Area',
      'City',
      'State',
      'Postal Code',
      'Country',
    ];

    const lines: string[] = [headers.join(',')];

    for (const s of students) {
      const row = [
        s.admissionNumber,
        s.firstName,
        s.lastName,
        s.email,
        s.phone,
        s.gender,
        s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : '',
        s.bloodGroup,
        s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '',
        s.nationalId,
        s.house,
        s.area,
        s.city,
        s.state,
        s.postalCode,
        s.country,
      ];
      lines.push(row.map(cell => this.escapeCsvValue(cell)).join(','))
    }

    return lines.join('\r\n')
  }
}
