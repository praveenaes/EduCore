import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types/chat';
import { ChatMessageType } from '../../types/chat';
import { Sparkles, Bot, User, FileText, Download } from 'lucide-react';

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  loading: boolean;
  isAiGenerating: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  loading,
  isAiGenerating,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  //autoscroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiGenerating]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-sm">
        Loading message history...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="text-sm font-medium text-gray-700">No messages yet</div>
          <div className="text-xs text-gray-400 mt-1 max-w-xs">
            Start the conversation or ask your AI Study Tutor for step-by-step assistance.
          </div>
        </div>
      ) : (
        messages.map((msg) => {
          if (msg.messageType === ChatMessageType.SYSTEM) {
            return (
              <div key={msg.id} className="flex justify-center my-3 animate-fade-in">
                <div className="px-3.5 py-1 bg-gray-200/80 text-gray-600 text-xs rounded-full font-medium shadow-2xs flex items-center gap-1.5 border border-gray-300/40">
                  <span>{msg.message}</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    • {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          }

          const isMe = String(msg.senderId) === String(currentUserId);
          const isAi = msg.isAi || msg.senderId === 'ai';

          if (isAi) {
            return (
              <div key={msg.id} className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-purple-900">
                      {msg.senderName || 'AI Tutor'}
                    </span>
                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                      Gemini Copilot
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-800 shadow-sm whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          }

          if (isMe) {
            return (
              <div key={msg.id} className="flex flex-col items-end max-w-xl ml-auto">
                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.message}
                </div>
                {msg.attachmentUrl && (
                  <a
                    href={msg.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-xs">{msg.attachmentName || 'Attachment'}</span>
                    <Download className="w-3 h-3 ml-1" />
                  </a>
                )}
                <span className="text-[10px] text-gray-400 mt-1 mr-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-800">
                    {msg.senderName || 'Member'}
                  </span>
                  {msg.senderRole && (
                    <span className="text-[10px] uppercase font-medium bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded border border-gray-200">
                      {msg.senderRole}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-800 shadow-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.message}
                </div>
                {msg.attachmentUrl && (
                  <a
                    href={msg.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-xs">{msg.attachmentName || 'Attachment'}</span>
                    <Download className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          );
        })
      )}

      {isAiGenerating && (
        <div className="flex gap-3 max-w-3xl mr-auto animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white border border-purple-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-purple-700 shadow-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
            <span className="text-xs font-medium">AI Assistant is thinking...</span>
            <div className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
