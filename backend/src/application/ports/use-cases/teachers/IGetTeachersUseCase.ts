import { GetTeachersRequest, GetTeachersResponse } from "../../../use-cases/teachers/GetTeachers";

export interface IGetTeachers {
  execute(req: GetTeachersRequest): Promise<GetTeachersResponse>;
}
