import { CourseResponseDTO, UpdateCourseDTO } from "@/application/dto/courses/courseDtos";

export interface IUpdateCourse {
  execute(id: string, dto: UpdateCourseDTO): Promise<CourseResponseDTO>;
}
