import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository } from "../../ports/repositories/ITeacherRepository";

export interface ExportTeachersRequest {
  search?: string;
}

@injectable()
export class ExportTeachersCsv {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  private escapeCsvValue(value: any): string {
    const str = value == null ? "" : String(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  async execute(req: ExportTeachersRequest): Promise<string> {
    const teachers = await this._teacherRepo.exportAll({ search: req.search?.trim() });

    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Joining Date',
      'Qualifications',
      'Specializations',
      'Experience (Years)',
      'Salary',
      'Gender',
      'Date of Birth',
      'Blood Group',
      'National ID',
      'House',
      'Area',
      'City',
      'State',
      'Postal Code',
      'Country',
    ];

    const lines: string[] = [headers.join(',')];

    for (const t of teachers) {
      const row = [
        t.employeeId,
        t.firstName,
        t.lastName,
        t.email,
        t.phone,
        t.joiningDate ? new Date(t.joiningDate).toISOString().split('T')[0] : '',
        t.qualifications,
        t.specializations,
        t.experience,
        t.salary,
        t.gender,
        t.dateOfBirth ? new Date(t.dateOfBirth).toISOString().split('T')[0] : '',
        t.bloodGroup,
        t.nationalId,
        t.house,
        t.area,
        t.city,
        t.state,
        t.postalCode,
        t.country,
      ];
      lines.push(row.map(cell => this.escapeCsvValue(cell)).join(','));
    }

    return lines.join('\r\n');
  }
}
