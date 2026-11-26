import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatMessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  isAiGroup?: boolean;
  isRemoved?: boolean;
  leftReason?: 'LEFT' | 'REMOVED' | null;
  isMutedByAdminOnly?: boolean;
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  isAiGroup = false,
  isRemoved = false,
  leftReason,
  isMutedByAdminOnly = false,
}) => {
  const [content, setContent] = useState('');
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping(true);//Emits live typing

     // Auto-clears typing status if you pause typing for 2 seconds:
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
  
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed WITHOUT Shift, send the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || disabled || isRemoved || isMutedByAdminOnly) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    onTyping(false);

    const messageToSend = content;
    setContent('');
    await onSendMessage(messageToSend);
  };

  const insertAiMention = () => {
    setContent((prev) => (prev ? `@ai ${prev}` : '@ai '));
    textareaRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-3 md:p-4 bg-white border-t border-gray-200 space-y-2">
      {!isAiGroup && !isRemoved && !isMutedByAdminOnly && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={insertAiMention}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-full transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Ask @AI
          </button>
          <span className="text-[11px] text-gray-400">
            Tip: Mention @ai to get instant Gemini tutor answers
          </span>
        </div>
      )}

      {isRemoved ? (
        <div
          className={`p-3 border rounded-xl text-center text-xs font-medium ${
            leftReason === 'LEFT'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {leftReason === 'LEFT'
            ? 'You left this group. You cannot send messages.'
            : 'You have been removed from this group by an administrator. You cannot send messages.'}
        </div>
      ) : isMutedByAdminOnly ? (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500 font-medium">
          Only admins can send messages in this group.
        </div>
      ) : (
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white focus-within:border-transparent transition-all">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isAiGroup
                ? 'Ask your AI Tutor anything (math, science, code, lesson plans)...'
                : 'Write a message... (Press Enter to send)'
            }
            rows={1}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none max-h-32 min-h-[38px]"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || disabled}
            className={`p-2.5 rounded-xl transition-all ${
              content.trim() && !disabled
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
