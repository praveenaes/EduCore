import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '../app/hooks';
import { tokenService } from '../utils/tokenService';
import type {
  ChatGroup,
  ChatMessage,
  CreateGroupPayload,
} from '../types/chat';
import { ChatGroupType, ChatMessageType } from '../types/chat';
import {
  getMyChatGroupsApi,
  createChatGroupApi,
  getGroupMessagesApi,
  sendChatMessageApi,
  getOrCreateAiTutorApi,
  clearGroupMessagesApi,
} from '../services/chatService';
import {
  connectChatSocket,
  joinChatGroup,
  leaveChatGroup,
  sendChatTyping,
  disconnectChatSocket,
} from '../services/chatSocket';

export const useChat = () => {
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const token = accessToken || tokenService.getToken() || '';

  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeGroupRef = useRef<ChatGroup | null>(null);
  activeGroupRef.current = activeGroup;

  const currentUserId = user?.id || '';

  const loadGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const res = await getMyChatGroupsApi();
      const freshGroups: ChatGroup[] = res.data.data.groups;
      setGroups(freshGroups);
      if (activeGroupRef.current) {
        const freshActive = freshGroups.find((g) => g.id === activeGroupRef.current?.id);
        if (freshActive) {
          setActiveGroup(freshActive);
        }
      }
    } catch (err) {
      console.error('Failed to load chat groups', err);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const loadMessages = useCallback(async (groupId: string) => {
    try {
      setLoadingMessages(true);
      const res = await getGroupMessagesApi(groupId, { page: 1, limit: 50 });
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error('Failed to load group messages', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  
  const selectGroup = useCallback(
    (group: ChatGroup) => {
      //If you clicked the group that is ALREADY open the return
      if (activeGroupRef.current?.id === group.id) return;
   //if already is in a aroom then leave
      if (activeGroupRef.current) {
        leaveChatGroup(activeGroupRef.current.id);
      }

      setActiveGroup(group);
      joinChatGroup(group.id);
      setTypingUsers([]);
      setIsAiGenerating(false);
      loadMessages(group.id);
    },
    [loadMessages]
  );





  //first runs
  useEffect(() => {
    if (!token || !user?.id) {
      setGroups([]);
      setActiveGroup(null);
      setMessages([]);
      return;
    }

    setGroups([]);
    setActiveGroup(null);
    setMessages([]);
    loadGroups();

    connectChatSocket(token, {
      // Handle incoming message
      onMessage: (message: ChatMessage) => {
        if (activeGroupRef.current?.id === message.groupId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
          if (message.isAi || message.senderId === 'ai') {
            setIsAiGenerating(false);
          }
        }
    
        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === message.groupId) {
              return {
                ...g,
                lastMessage: {
                  message: message.message,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  sentAt: message.createdAt,
                  messageType: message.messageType,
                },
              };
            }
            return g;
          })
        );
      },
       // Handle typing event
      onTyping: (data: { groupId: string; userId: string; isTyping: boolean }) => {
        if (activeGroupRef.current?.id !== data.groupId) return;
        if (data.userId === currentUserId) return;

        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.userId) ? prev : [...prev, data.userId];
          }
          return prev.filter((id) => id !== data.userId);
        });
      },
      onGroupUpdated: () => {
        loadGroups();
      },
       // Handle cleared messages
      onMessagesCleared: (data: { groupId: string }) => {
        if (activeGroupRef.current?.id === data.groupId) {
          setMessages([]);
        }
        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === data.groupId) {
              const { lastMessage, ...rest } = g;
              return rest as ChatGroup;
            }
            return g;
          })
        );
      },
    });

    return () => {
      if (activeGroupRef.current) {
        leaveChatGroup(activeGroupRef.current.id);
      }
      disconnectChatSocket();
    };
  }, [token, user?.id, currentUserId, loadGroups]);






  


  const sendMessage = async (
    content: string,
    messageType: ChatMessageType = ChatMessageType.TEXT,
    attachmentUrl?: string,
    attachmentName?: string,
    attachmentSize?: number
  ) => {
    if (!activeGroup || (!content.trim() && !attachmentUrl)) return;

    try {
      setSending(true);
      sendChatTyping(activeGroup.id, false);

      const trimmed = content.trim();
      const mentionsAi =
        activeGroup.groupType === ChatGroupType.AI_BOT ||
        trimmed.toLowerCase().includes('@ai') ||
        trimmed.toLowerCase().includes('@educore');

      if (mentionsAi) {
        setIsAiGenerating(true);
      }

      const res = await sendChatMessageApi({
        groupId: activeGroup.id,
        message: trimmed,
        messageType,
        attachmentUrl,
        attachmentName,
        attachmentSize,
      });

      const savedMessage = res.data.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === savedMessage.id)) return prev;
        return [...prev, savedMessage];
      });
    } catch (err) {
      console.error('Failed to send message', err);
      setIsAiGenerating(false);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!activeGroup) return;
    sendChatTyping(activeGroup.id, isTyping);
  };

  const openAiTutor = async () => {
    try {
      const res = await getOrCreateAiTutorApi();
      const aiGroup = res.data.data;
      setGroups((prev) => {
        const exists = prev.some((g) => g.id === aiGroup.id);
        return exists ? prev : [aiGroup, ...prev];
      });
      selectGroup(aiGroup);
    } catch (err) {
      console.error('Failed to open AI Tutor', err);
    }
  };


//
  const createGroup = async (payload: CreateGroupPayload) => {
    try {
      const res = await createChatGroupApi(payload);
      const newGroup = res.data.data;
      setGroups((prev) => [newGroup, ...prev]);
      selectGroup(newGroup);
      return newGroup;
    } catch (err) {
      console.error('Failed to create group', err);
      throw err;
    }
  };



  const clearChat = async (groupId: string) => {
    try {
      await clearGroupMessagesApi(groupId);
      if (activeGroupRef.current?.id === groupId) {
        setMessages([]);
      }
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            const { lastMessage, ...rest } = g;
            return rest as ChatGroup;
          }
          return g;
        })
      );
    } catch (err) {
      console.error('Failed to clear chat', err);
      throw err;
    }
  };

  const filteredGroups = groups.filter((g) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'AI' && g.groupType === ChatGroupType.AI_BOT) ||
      (filterType === 'CUSTOM' && g.groupType === ChatGroupType.CUSTOM) ||
      (filterType === 'DIRECT' && g.groupType === ChatGroupType.DIRECT);

    const matchesSearch =
      !searchQuery.trim() ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return {
    groups: filteredGroups,
    allGroups: groups,
    activeGroup,
    messages,
    loadingGroups,
    loadingMessages,
    sending,
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
    reloadGroups: loadGroups,
  };
};