import { GetStudentsRequest, GetStudentsResponse } from "../../../use-cases/students/GetStudents";

export interface IGetStudents {
  execute(req: GetStudentsRequest): Promise<GetStudentsResponse>;
}
