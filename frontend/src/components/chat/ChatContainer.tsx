import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatMessageInput } from './ChatMessageInput';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupMembersModal } from './GroupMembersModal';
import { ChatGroupType, ChatMemberRole } from '../../types/chat';
import { MessageSquare, Sparkles, Bot } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';

export const ChatContainer: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?.id || '';
  
  const {
    groups,
    activeGroup,
    messages,
    loadingGroups,
    loadingMessages,
    isAiGenerating,
    typingUsers,
    filterType,
    searchQuery,
    setFilterType,
    setSearchQuery,
    selectGroup,
    sendMessage,
    handleTyping,
    openAiTutor,
    createGroup,
    clearChat,
    reloadGroups,
  } = useChat();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');

  const handleSelectGroup = (group: any) => {
    selectGroup(group);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('sidebar');
  };

  const currentMemberRecord = activeGroup?.members?.find(
    (m) => String(m.userId) === String(currentUserId)
  );
  const isRemoved = Boolean(currentMemberRecord?.leftAt);
  const isGroupAdmin =
    Boolean(activeGroup?.createdBy && String(activeGroup.createdBy) === String(currentUserId)) ||
    currentMemberRecord?.role === ChatMemberRole.ADMIN;
  const isMutedByAdminOnly = Boolean(activeGroup?.isAdminOnly && !isGroupAdmin);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div
        className={`${
          mobileView === 'sidebar' ? 'block' : 'hidden'
        } md:block w-full md:w-auto h-full flex-shrink-0`}
      >
        <ChatSidebar
          groups={groups}
          activeGroup={activeGroup}
          loading={loadingGroups}
          filterType={filterType}
          searchQuery={searchQuery}
          onSelectGroup={handleSelectGroup}
          onSetFilterType={setFilterType}
          onSetSearchQuery={setSearchQuery}
          onOpenAiTutor={openAiTutor}
          onOpenCreateGroupModal={() => setIsCreateModalOpen(true)}
        />
      </div>

      <div
        className={`${
          mobileView === 'chat' ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col h-full bg-white min-w-0`}
      >
        {activeGroup ? (
          <>
            <ChatHeader
              group={activeGroup}
              typingUsers={typingUsers}
              isAiGenerating={isAiGenerating}
              onBackToList={handleBackToList}
              onOpenMembersModal={() => setIsMembersModalOpen(true)}
            />

            {isRemoved && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-semibold">
                    {currentMemberRecord?.leftReason === 'LEFT'
                      ? 'Notice: You left the group.'
                      : 'Notice: Admin removed you from this group.'}
                  </span>
                </div>
                <span className="text-[11px] text-amber-600 font-medium">Read-only history</span>
              </div>
            )}

            <ChatMessageList
              messages={messages}
              currentUserId={currentUserId}
              loading={loadingMessages}
              isAiGenerating={isAiGenerating}
            />

            <ChatMessageInput
              onSendMessage={sendMessage}
              onTyping={handleTyping}
              disabled={isAiGenerating || isRemoved || isMutedByAdminOnly}
              isAiGroup={activeGroup.groupType === ChatGroupType.AI_BOT}
              isRemoved={isRemoved}
              leftReason={currentMemberRecord?.leftReason}
              isMutedByAdminOnly={isMutedByAdminOnly}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600 shadow-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Select a Conversation</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Choose a group discussion or launch your private AI Study Tutor.
            </p>
            <button
              onClick={openAiTutor}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Open AI Copilot</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createGroup}
      />

      {activeGroup && (
        <GroupMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          group={activeGroup}
          currentUserId={currentUserId}
          currentUserName={user?.name}
          onMemberUpdated={reloadGroups}
          onClearChat={() => clearChat(activeGroup.id)}
        />
      )}
    </div>
  );
};
