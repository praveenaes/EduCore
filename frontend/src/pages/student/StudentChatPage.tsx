import React from 'react';
import { ChatContainer } from '../../components/chat/ChatContainer';

export const StudentChatPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Class Discussions & AI Study Tutor
          </h1>
          <p className="text-sm text-gray-500">
            Collaborate with your classmates and ask your AI Study Tutor for step-by-step math and science problem solving.
          </p>
        </div>
      </div>
      <ChatContainer />
    </div>
  );
};

export default StudentChatPage;
