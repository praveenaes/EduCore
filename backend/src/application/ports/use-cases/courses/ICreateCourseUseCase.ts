import { CreateCourseDTO, CourseResponseDTO } from "@/application/dto/courses/courseDtos";

export interface ICreateCourse {
  execute(dto: CreateCourseDTO): Promise<CourseResponseDTO>;
}
