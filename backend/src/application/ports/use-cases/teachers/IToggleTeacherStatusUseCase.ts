import { ToggleTeacherStatusRequest } from "../../../use-cases/teachers/ToggleTeacherStatus";
import { Teacher } from "../../../../domain/entities/Teacher";

export interface IToggleTeacherStatus {
  execute(req: ToggleTeacherStatusRequest): Promise<Teacher>;
}
