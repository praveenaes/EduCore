export interface CourseLevel {
  levelNumber: number; 
  name: string;        
}

export interface Course {
  id: string;
  programId: string;
  programName?: string; 
  name: string;
  code: string;
  description: string;
  durationMonths: number;
  levelName: string;   
  levelCount: number;  
  levels: CourseLevel[];
  createdAt?: string;
}

export interface CourseListResponse {
  success: boolean;
  data: {
    courses: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCoursePayload {
  programId: string;
  name: string;
  code: string;
  description: string;
  durationMonths: number;
  levelName: string;
  levelCount: number;
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;
