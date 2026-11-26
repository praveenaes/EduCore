import React from 'react';
import { ChatContainer } from '../../components/chat/ChatContainer';

export const TeacherChatPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Faculty Chat & AI Lesson Copilot
          </h1>
          <p className="text-sm text-gray-500">
            Communicate with your batches and draft quizzes, rubrics, and lesson plans with your AI Teaching Assistant.
          </p>
        </div>
      </div>
      <ChatContainer />
    </div>
  );
};

export default TeacherChatPage;
