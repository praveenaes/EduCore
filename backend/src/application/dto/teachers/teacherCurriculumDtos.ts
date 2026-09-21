export interface TeacherAssignedSubjectDTO {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  levelNumber: number;
  levelName: string;
  programName?: string;
  programCode?: string;
}

export interface TeacherInChargeBatchDTO {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  levelNumber: number;
  levelName: string;
  centerId: string;
  centerName: string;
  academicYearId: string;
  academicYearName: string;
}

export interface TeacherAcademicCurriculumDTO {
  teacherStatus: "Active" | "Inactive";
  employeeId: string;
  specialization?: string;
  summary: {
    totalSubjects: number;
    totalBatches: number;
    totalCourses: number;
    totalCenters: number;
    totalPrograms: number;
  };
  scope: {
    programs: Array<{ id?: string; name: string; code?: string }>;
    courses: Array<{ id?: string; name: string; code?: string }>;
    levels: Array<{ levelNumber: number; levelName: string }>;
    centers: Array<{ id?: string; name: string }>;
    academicYears: Array<{ id?: string; name: string }>;
  };
  assignedSubjects: TeacherAssignedSubjectDTO[];
  inChargeBatches: TeacherInChargeBatchDTO[];
}
