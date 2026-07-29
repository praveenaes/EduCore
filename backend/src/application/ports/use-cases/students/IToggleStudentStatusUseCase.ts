import { ToggleStatusRequest } from "../../../use-cases/students/ToggleStudentStatus";
import { Student } from "../../../../domain/entities/Student";

export interface IToggleStudentStatus {
  execute(req: ToggleStatusRequest): Promise<Student>;
}
