import { injectable } from 'inversify';
import { Types } from 'mongoose';
import { IGetCandidateMembersUseCase } from '@/application/ports/use-cases/chat/IGetCandidateMembersUseCase';
import { CandidateMemberDTO } from '@/application/dto/chat/chatDtos';
import { TeacherModel } from '@/infra/db/models/TeacherModel';
import { StudentModel } from '@/infra/db/models/StudentModel';
import { BatchModel } from '@/infra/db/models/BatchModel';
import { SubjectAssignmentModel } from '@/infra/db/models/SubjectAssignmentModel';
import { UserRole } from '@/domain/enums/UserRole';

@injectable()
export class GetCandidateMembers implements IGetCandidateMembersUseCase {
  async execute(userId: string, role: string): Promise<CandidateMemberDTO[]> {
    const normalizedRole = role.toUpperCase();

    if (normalizedRole === UserRole.ADMIN) {
      const teachers = await TeacherModel.find({ isDeleted: false, isActive: true })
        .select('userId firstName lastName email photo employeeId')
        .lean();

      return teachers.map((t) => ({
        id: t.userId ? t.userId.toString() : t._id.toString(),
        name: `${t.firstName} ${t.lastName}`.trim(),
        email: t.email,
        role: 'Teacher',
        photo: t.photo || undefined,
        subtitle: `Teacher • ID: ${t.employeeId}`,
      }));
    }

    if (normalizedRole === UserRole.TEACHER) {
      const teacher = await TeacherModel.findOne({
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      }).lean();

      if (!teacher) {
        return [];
      }

      const directBatches = await BatchModel.find({
        teacherId: teacher._id,
        isDeleted: false,
      })
        .select('_id name')
        .lean();

      const assignments = await SubjectAssignmentModel.find({
        teacherId: teacher._id,
        isDeleted: false,
      })
        .select('courseId levelNumber')
        .lean();

      let assignmentBatches: any[] = [];
      if (assignments.length > 0) {
        const assignmentQueries = assignments.map((a) => ({
          courseId: a.courseId,
          levelNumber: a.levelNumber,
        }));
        assignmentBatches = await BatchModel.find({
          isDeleted: false,
          $or: assignmentQueries,
        })
          .select('_id name')
          .lean();
      }

      const batchMap = new Map<string, string>();
      directBatches.forEach((b) => batchMap.set(b._id.toString(), b.name));
      assignmentBatches.forEach((b) => batchMap.set(b._id.toString(), b.name));
      const batchIds = Array.from(batchMap.keys()).map((id) => new Types.ObjectId(id));

      if (batchIds.length === 0) {
        return [];
      }

      const students = await StudentModel.find({
        batchId: { $in: batchIds },
        isDeleted: false,
        isActive: true,
      })
        .select('userId firstName lastName email photo batchId admissionNumber')
        .populate({ path: 'batchId', select: 'name' })
        .lean();

      return students.map((s) => {
        const batchName = (s.batchId as any)?.name || batchMap.get(s.batchId?.toString()) || 'Student';
        return {
          id: s.userId ? s.userId.toString() : s._id.toString(),
          name: `${s.firstName} ${s.lastName}`.trim(),
          email: s.email,
          role: 'Student',
          photo: s.photo || undefined,
          batchName,
          subtitle: `${batchName} • Roll: ${s.admissionNumber}`,
        };
      });
    }

    if (normalizedRole === UserRole.STUDENT) {
      const student = await StudentModel.findOne({
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      }).lean();

      if (!student || !student.batchId) {
        return [];
      }

      const peers = await StudentModel.find({
        batchId: student.batchId,
        userId: { $ne: student.userId },
        isDeleted: false,
        isActive: true,
      })
        .select('userId firstName lastName email photo batchId admissionNumber')
        .populate({ path: 'batchId', select: 'name' })
        .lean();

      return peers.map((p) => {
        const batchName = (p.batchId as any)?.name || 'Classmate';
        return {
          id: p.userId ? p.userId.toString() : p._id.toString(),
          name: `${p.firstName} ${p.lastName}`.trim(),
          email: p.email,
          role: 'Student',
          photo: p.photo || undefined,
          batchName,
          subtitle: `${batchName} • Roll: ${p.admissionNumber}`,
        };
      });
    }

    return [];
  }
}
