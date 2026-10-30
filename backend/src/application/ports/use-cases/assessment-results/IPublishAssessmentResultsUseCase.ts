export interface PublishAssessmentResultsRequest {
  assessmentId?: string;
  scheduleId?: string;
  isPublished: boolean;
}

export interface IPublishAssessmentResultsUseCase {
  execute(req: PublishAssessmentResultsRequest): Promise<{ id: string; status: string; isPublished: boolean }>;
}
