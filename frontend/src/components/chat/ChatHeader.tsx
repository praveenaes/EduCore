import React from 'react';
import type { ChatGroup } from '../../types/chat';
import { ChatGroupType } from '../../types/chat';
import {
  ArrowLeft,
  Bot,
  Users,
  Sparkles,
} from 'lucide-react';

interface ChatHeaderProps {
  group: ChatGroup;
  typingUsers: string[];
  isAiGenerating: boolean;
  onBackToList?: () => void;
  onOpenMembersModal?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  group,
  typingUsers,
  isAiGenerating,
  onBackToList,
  onOpenMembersModal,
}) => {
  const getHeaderIcon = (type: ChatGroupType) => {
    switch (type) {
      case ChatGroupType.AI_BOT:
        return <Bot className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const isAi = group.groupType === ChatGroupType.AI_BOT;

  return (
    <div className="h-16 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {onBackToList && (
          <button
            onClick={onBackToList}
            className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          {getHeaderIcon(group.groupType)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
              {group.name}
            </h3>
            {isAi && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Gemini 2.0
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
            {isAiGenerating ? (
              <span className="text-purple-600 font-medium animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Assistant is responding...
              </span>
            ) : typingUsers.length > 0 ? (
              <span className="text-indigo-600 font-medium animate-pulse">
                Someone is typing...
              </span>
            ) : (
              group.description || `${group.members?.length || 1} members`
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
       

        {onOpenMembersModal && !isAi && (
          <button
            onClick={onOpenMembersModal}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Group Members"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Members</span>
          </button>
        )}
      </div>
    </div>
  );
};
