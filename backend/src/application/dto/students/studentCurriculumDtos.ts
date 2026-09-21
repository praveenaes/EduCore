export interface StudentAssignedSubjectDTO {
  id: string;
  name: string;
  code: string;
  teacherName?: string;
  teacherEmployeeId?: string;
}

export interface StudentAcademicCurriculumDTO {
  studentStatus: string;
  program: {
    id?: string;
    name: string;
    code?: string;
  };
  course: {
    id?: string;
    name: string;
    code?: string;
  };
  level: {
    levelNumber: number;
    levelName: string;
  };
  batch: {
    id?: string;
    name: string;
  };
  center: {
    id?: string;
    name: string;
  };
  academicYear: {
    id?: string;
    name: string;
  };
  batchTeacher: {
    id?: string;
    name: string;
    employeeId?: string;
  };
  subjects: StudentAssignedSubjectDTO[];
}
