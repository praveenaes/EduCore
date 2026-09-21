export interface CourseLevelDTO {
  levelNumber: number;
  name: string;
}

export interface CreateCourseDTO {
  programId: string;
  name: string;
  code: string;
  description?: string;
  durationMonths?: number;
  levelName: string;
  levelCount: number;
}

export interface UpdateCourseDTO {
  programId?: string;
  name?: string;
  code?: string;
  description?: string;
  durationMonths?: number;
  levelName?: string;
  levelCount?: number;
}

export interface CourseResponseDTO {
  id: string;
  programId: string;
  programName?: string;
  name: string;
  code: string;
  description: string;
  durationMonths?: number;
  levelName: string;
  levelCount: number;
  levels: CourseLevelDTO[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseListResultDTO {
  courses: CourseResponseDTO[];
  total: number;
}
