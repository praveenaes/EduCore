import { ExportTeachersRequest } from "../../../use-cases/teachers/ExportTeachersCsv";

export interface IExportTeachersCsv {
  execute(req: ExportTeachersRequest): Promise<string>;
}
