import React from 'react';
import type { ChatGroup } from '../../types/chat';
import { ChatGroupType } from '../../types/chat';
import {
  Search,
  Plus,
  Bot,
  Users,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useAppSelector } from '../../app/hooks';

interface ChatSidebarProps {
  groups: ChatGroup[];
  activeGroup: ChatGroup | null;
  loading: boolean;
  filterType: string;
  searchQuery: string;
  onSelectGroup: (group: ChatGroup) => void;
  onSetFilterType: (filter: string) => void;
  onSetSearchQuery: (query: string) => void;
  onOpenAiTutor: () => void;
  onOpenCreateGroupModal: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  groups,
  activeGroup,
  loading,
  filterType,
  searchQuery,
  onSelectGroup,
  onSetFilterType,
  onSetSearchQuery,
  onOpenAiTutor,
  onOpenCreateGroupModal,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?.id || '';

  const getGroupIcon = (type: ChatGroupType) => {
    switch (type) {
      case ChatGroupType.AI_BOT:
        return <Bot className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getGroupBadgeClass = (type: ChatGroupType) => {
    switch (type) {
      case ChatGroupType.AI_BOT:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Messages
          </h2>
{/* create new group  */}
          <button
            onClick={onOpenCreateGroupModal}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
            title="Create New Group"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Group</span>
          </button>
        </div>

        <button
          onClick={onOpenAiTutor}
          className="w-full p-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white rounded-xl shadow-sm flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold leading-tight">AI Assistant</div>
              <div className="text-xs text-purple-100">1-on-1 Gemini Copilot</div>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">Ask AI</span>
        </button>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSetSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {['ALL', 'AI', 'CUSTOM'].map((filter) => (
            <button
              key={filter}
              onClick={() => onSetFilterType(filter)}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                filterType === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter === 'AI' ? 'AI Tutor' : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading conversations...</div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No conversations found
          </div>
        ) : (
          groups.map((group) => {
            const isSelected = activeGroup?.id === group.id;
            const myMemberRecord = group.members?.find((m) => String(m.userId) === String(currentUserId));
            const isRemoved = Boolean(myMemberRecord?.leftAt);
            const isSelfLeft = myMemberRecord?.leftReason === 'LEFT';

            return (
// individual group              
              <button
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                  isSelected ? 'bg-indigo-50/70' : 'hover:bg-gray-50'
                }`}
              >
{/* custom /All/AI tutor */}
                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getGroupIcon(group.groupType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {group.name}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isRemoved && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            isSelfLeft
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {isSelfLeft ? 'Left' : 'Removed'}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getGroupBadgeClass(
                          group.groupType
                        )}`}
                      >
                        {group.groupType === ChatGroupType.AI_BOT ? 'AI' : group.groupType}
                      </span>
                    </div>
                  </div>

                  {isRemoved ? (
                    <p
                      className={`text-xs font-medium truncate ${
                        isSelfLeft ? 'text-amber-600' : 'text-red-500'
                      }`}
                    >
                      {isSelfLeft ? 'You left this group' : 'Admin removed you from this group'}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 truncate">
                      {group.lastMessage ? (
                        <>
                          <span className="font-medium text-gray-700">
                            {group.lastMessage.senderName || 'Member'}:{' '}
                          </span>
                          {group.lastMessage.message}
                        </>
                      ) : (
                        group.description || 'Start a conversation'
                      )}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
