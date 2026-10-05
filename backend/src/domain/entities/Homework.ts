export type HomeworkStatus = 'pending' | 'submitted' | 'verified' | 'redo' | 'late';

export interface HomeworkAttachmentProps {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface HomeworkSubmissionProps {
  id?: string;
  studentId: string;
  status: HomeworkStatus;
  submittedAt?: Date | null;
  verifiedAt?: Date | null;
  remarks?: string;
  attachments?: HomeworkAttachmentProps[];

  // Populated display helpers
  studentName?: string;
  admissionNumber?: string;
}

export interface HomeworkProps {
  id?: string;
  title: string;
  description?: string;
  batchId: string;
  subjectId: string;
  assignedBy: string; // Teacher ID
  dueDate: Date;
  attachments: HomeworkAttachmentProps[];
  submissions: HomeworkSubmissionProps[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated display helpers
  batchName?: string;
  subjectName?: string;
  teacherName?: string;
}

export class Homework {
  private _props: HomeworkProps;

  constructor(props: HomeworkProps) {
    this._props = {
      ...props,
      attachments: props.attachments ? [...props.attachments] : [],
      submissions: props.submissions ? [...props.submissions] : [],
      isActive: props.isActive ?? true,
      isDeleted: props.isDeleted ?? false,
    };
  }

  // Getters
  get id(): string | undefined { return this._props.id; }
  get title(): string { return this._props.title; }
  get description(): string | undefined { return this._props.description; }
  get batchId(): string { return this._props.batchId; }
  get subjectId(): string { return this._props.subjectId; }
  get assignedBy(): string { return this._props.assignedBy; }
  get dueDate(): Date { return this._props.dueDate; }
  get attachments(): HomeworkAttachmentProps[] { return this._props.attachments; }
  get submissions(): HomeworkSubmissionProps[] { return this._props.submissions; }
  get isActive(): boolean { return this._props.isActive; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  // Populated helpers
  get batchName(): string | undefined { return this._props.batchName; }
  get subjectName(): string | undefined { return this._props.subjectName; }
  get teacherName(): string | undefined { return this._props.teacherName; }

  // Computed counters
  get totalStudents(): number { return this._props.submissions.length; }
  get submittedCount(): number {
    return this._props.submissions.filter((s) => s.status !== 'pending').length;
  }
  get verifiedCount(): number {
    return this._props.submissions.filter((s) => s.status === 'verified').length;
  }

  // Business Methods
  updateDetails(details: {
    title?: string;
    description?: string;
    dueDate?: Date;
    attachments?: HomeworkAttachmentProps[];
  }): void {
    if (details.title) this._props.title = details.title.trim();
    if (details.description !== undefined) this._props.description = details.description.trim();
    if (details.dueDate) this._props.dueDate = details.dueDate;
    if (details.attachments) this._props.attachments = [...details.attachments];
    this._props.updatedAt = new Date();
  }

  submitStudentSolution(studentId: string, attachments: HomeworkAttachmentProps[], isLate: boolean = false): void {
    const sub = this._props.submissions.find((s) => s.studentId === studentId);
    if (sub) {
      sub.attachments = [...attachments];
      sub.status = isLate ? 'late' : 'submitted';
      sub.submittedAt = new Date();
      this._props.updatedAt = new Date();
    }
  }

  reviewStudentSubmission(studentId: string, status: 'verified' | 'redo', remarks?: string): void {
    const sub = this._props.submissions.find((s) => s.studentId === studentId);
    if (sub) {
      sub.status = status;
      sub.remarks = remarks?.trim();
      sub.verifiedAt = new Date();
      this._props.updatedAt = new Date();
    }
  }

  static createNew(props: {
    title: string;
    description?: string;
    batchId: string;
    subjectId: string;
    assignedBy: string;
    dueDate: Date;
    attachments?: HomeworkAttachmentProps[];
    studentIds: string[];
  }): Homework {
    const submissions: HomeworkSubmissionProps[] = props.studentIds.map((studentId) => ({
      studentId,
      status: 'pending',
      attachments: [],
    }));

    return new Homework({
      title: props.title.trim(),
      description: props.description?.trim(),
      batchId: props.batchId,
      subjectId: props.subjectId,
      assignedBy: props.assignedBy,
      dueDate: props.dueDate,
      attachments: props.attachments || [],
      submissions,
      isActive: true,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      batchId: this.batchId,
      subjectId: this.subjectId,
      assignedBy: this.assignedBy,
      dueDate: this.dueDate,
      attachments: this.attachments,
      submissions: this.submissions,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      batchName: this.batchName,
      subjectName: this.subjectName,
      teacherName: this.teacherName,
      totalStudents: this.totalStudents,
      submittedCount: this.submittedCount,
      verifiedCount: this.verifiedCount,
    };
  }
}
