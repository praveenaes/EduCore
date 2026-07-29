import { ExportStudentsRequest } from "../../../use-cases/students/ExportStudentsCsv";

export interface IExportStudentsCsv {
  execute(req: ExportStudentsRequest): Promise<string>;
}
