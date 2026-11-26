import { ChatGroup } from '../entities/ChatGroup';
import { IBaseRepository } from './IBaseRepository';

export interface ChatGroupFilters {
  userId?: string;
  search?: string;
  groupType?: string;
}

export interface ChatGroupPagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ChatGroupListResult {
  groups: ChatGroup[];
  total: number;
}

export interface IChatGroupRepository extends IBaseRepository<ChatGroup> {
  findByUser(userId: string, filters?: ChatGroupFilters, pagination?: ChatGroupPagination): Promise<ChatGroupListResult>;
  findAiBotGroup(userId: string): Promise<ChatGroup | null>;
  isMember(groupId: string, userId: string): Promise<boolean>;
  isAdmin(groupId: string, userId: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
}