import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Trash2, Shield, LogOut, Search, CheckSquare, Square } from 'lucide-react';
import type { ChatGroup, CandidateMember } from '../../types/chat';
import { ChatMemberRole } from '../../types/chat';
import { addGroupMemberApi, removeGroupMemberApi, getCandidateMembersApi } from '../../services/chatService';
import { ConfirmationModal } from '../ConfirmationModal';

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ChatGroup;
  currentUserId: string;
  currentUserName?: string;
  onMemberUpdated: () => void;
  onClearChat?: () => Promise<void>;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  isOpen,
  onClose,
  group,
  currentUserId,
  currentUserName,
  onMemberUpdated,
  onClearChat,
}) => {
  const [currentGroup, setCurrentGroup] = useState<ChatGroup>(group);
  const [candidates, setCandidates] = useState<CandidateMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentGroup(group);
  }, [group]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set());
      setSearch('');
      setError(null);
      setMemberToRemove(null);
      setShowClearConfirm(false);
      return;
    }

    const fetchCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const res = await getCandidateMembersApi();
        setCandidates(res.data.data || []);
      } catch (err: any) {
        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, [isOpen, group.id]);

  if (!isOpen) return null;

  const isAdmin =
    currentGroup.createdBy === currentUserId ||
    currentGroup.members?.some(
      (m) => String(m.userId) === String(currentUserId) && m.role === ChatMemberRole.ADMIN && !m.leftAt
    );

  const activeMembers = (currentGroup.members || []).filter((m) => !m.leftAt);
  const activeMemberIds = new Set(activeMembers.map((m) => String(m.userId)));
  const availableCandidates = candidates.filter((c) => !activeMemberIds.has(String(c.id)));
  const addedMembers = activeMembers.filter((m) => String(m.userId) !== String(currentGroup.createdBy));

  const rolePlural =
    candidates[0]?.role === 'Student'
      ? 'students'
      : candidates[0]?.role === 'Teacher'
      ? 'teachers'
      : 'members';
  const roleSingular =
    candidates[0]?.role === 'Student'
      ? 'student'
      : candidates[0]?.role === 'Teacher'
      ? 'teacher'
      : 'member';

  const candidateMap = new Map<string, CandidateMember>();
  candidates.forEach((c) => candidateMap.set(String(c.id), c));

  const filteredCandidates = availableCandidates.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
      (c.batchName && c.batchName.toLowerCase().includes(q))
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
    }
  };

//ADD MEMBERS
  const handleAddSelected = async (targetId?: string) => {
    const idsToAdd = targetId ? [targetId] : Array.from(selectedIds);
    if (idsToAdd.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const res = await addGroupMemberApi(currentGroup.id, idsToAdd);
      if (res.data?.data) {
        setCurrentGroup(res.data.data);
      }
      setSelectedIds(new Set());
      onMemberUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member(s)');
    } finally {
      setLoading(false);
    }
  };

  //REMOVE
  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      setRemoveLoading(true);
      setError(null);
      const res = await removeGroupMemberApi(currentGroup.id, memberToRemove.id);
      if (res.data?.data) {
        setCurrentGroup(res.data.data);
      }
      onMemberUpdated();
      if (memberToRemove.id === currentUserId) {
        onClose();
      }
      setMemberToRemove(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoveLoading(false);
    }
  };

 //CLEAR CHAT 
  const handleConfirmClearChat = async () => {
    if (!onClearChat) return;
    try {
      setClearLoading(true);
      setError(null);
      await onClearChat();
      setShowClearConfirm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear chat');
    } finally {
      setClearLoading(false);
    }
  };

  const allFilteredSelected =
    filteredCandidates.length > 0 && selectedIds.size >= filteredCandidates.length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{currentGroup.name}</h3>
                <p className="text-xs text-gray-500">
                  {addedMembers.length === 0
                    ? 'Add Members'
                    : `${addedMembers.length} Added Member${addedMembers.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {isAdmin ? (
              <>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      Add Members ({selectedIds.size} selected)
                    </span>
                    {filteredCandidates.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        {allFilteredSelected ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" /> Deselect All
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5" /> Select All ({filteredCandidates.length})
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search ${rolePlural} by name or email...`}
                      className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
                    {loadingCandidates ? (
                      <div className="p-3 text-center text-xs text-gray-400">Loading {rolePlural}...</div>
                    ) : filteredCandidates.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400">
                        {availableCandidates.length === 0
                          ? `All eligible ${rolePlural} are already added`
                          : `No matching ${rolePlural} found`}
                      </div>
                    ) : (
                      filteredCandidates.map((candidate) => {
                        const isChecked = selectedIds.has(candidate.id);
                        return (
                          <div
                            key={candidate.id}
                            className={`flex items-center justify-between p-2 hover:bg-gray-50 transition-colors ${
                              isChecked ? 'bg-indigo-50/40' : ''
                            }`}
                          >
                            <div
                              onClick={() => toggleSelect(candidate.id)}
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 pointer-events-none"
                              />
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-[10px] flex-shrink-0">
                                {candidate.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-xs text-gray-900 truncate">
                                  {candidate.name}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate">
                                  {candidate.subtitle || candidate.email}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddSelected(candidate.id)}
                              disabled={loading}
                              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors ml-2"
                            >
                              Add
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAddSelected()}
                      disabled={loading}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Selected ({selectedIds.size})
                    </button>
                  )}
                </div>
{/* Already Added Members part */}
                {addedMembers.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-gray-700 pb-1 flex items-center justify-between border-b border-gray-100">
                      <span>Already Added Members ({addedMembers.length})</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {addedMembers.map((member) => {
                        const candidateInfo = candidateMap.get(String(member.userId));
                        const displayName =
                          member.userName ||
                          candidateInfo?.name ||
                          `Member ${member.userId.slice(-6)}`;
                        const displaySubtitle =
                          candidateInfo?.subtitle || candidateInfo?.email || 'Member';

                        return (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate text-xs">
                                  {displayName}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate">
                                  {displaySubtitle}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setMemberToRemove({ id: member.userId, name: displayName })}
                              disabled={loading || removeLoading}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={`Remove ${roleSingular} from group`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2 divide-y divide-gray-100">
                <div className="text-xs font-bold text-gray-700 pb-1">Group Members</div>
                {activeMembers.map((member) => {
                  const isMemberAdmin = member.role === ChatMemberRole.ADMIN;
                  const isCreator = currentGroup.createdBy === member.userId;
                  const isMe = member.userId === currentUserId;
                  const candidateInfo = candidateMap.get(String(member.userId));
                  const displayName =
                    member.userName ||
                    candidateInfo?.name ||
                    (isMe && currentUserName ? currentUserName : undefined) ||
                    `User ${member.userId.slice(-6)}`;

                  return (
                    <div
                      key={member.userId}
                      className="pt-2 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate flex items-center gap-1.5 text-xs">
                            <span>{displayName}</span>
                            {isMe && <span className="text-xs text-indigo-600 font-semibold">(You)</span>}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {isCreator ? 'Creator & Admin' : isMemberAdmin ? 'Admin' : 'Member'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isMemberAdmin && (
                          <span className="p-1 text-purple-600 bg-purple-50 rounded-md" title="Admin">
                            <Shield className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
{/* for members */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              {currentGroup.createdBy !== currentUserId && (
                <button
                  onClick={() => setMemberToRemove({ id: currentUserId, name: 'yourself' })}
                  disabled={loading || removeLoading || clearLoading}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Group
                </button>
              )}
              {onClearChat && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={loading || removeLoading || clearLoading}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Chat
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(memberToRemove)}
        title={memberToRemove?.id === currentUserId ? 'Leave Group' : 'Remove Member'}
        message={
          memberToRemove?.id === currentUserId
            ? `Are you sure you want to leave "${currentGroup.name}"? You will only have read-only access to historical messages.`
            : `Are you sure you want to remove ${memberToRemove?.name || 'this member'} from "${currentGroup.name}"? They will lose access to new messages in this group.`
        }
        confirmText={memberToRemove?.id === currentUserId ? 'Leave' : 'Remove'}
        cancelText="Cancel"
        confirmVariant="danger"
        loading={removeLoading}
        onConfirm={handleConfirmRemove}
        onCancel={() => setMemberToRemove(null)}
      />

      <ConfirmationModal
        isOpen={showClearConfirm}
        title="Clear Chat History"
        message={`Are you sure you want to clear all messages from "${currentGroup.name}"? This action cannot be undone and will delete all messages for everyone.`}
        confirmText="Clear Chat"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={clearLoading}
        onConfirm={handleConfirmClearChat}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
};