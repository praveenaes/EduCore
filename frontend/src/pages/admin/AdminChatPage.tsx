import React from 'react';
import { ChatContainer } from '../../components/chat/ChatContainer';

export const AdminChatPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Institutional Communications & AI Assistant
          </h1>
          <p className="text-sm text-gray-500">
            Broadcast to batches, manage staff channels, and consult the EduCore AI Secretary.
          </p>
        </div>
      </div>
      <ChatContainer />
    </div>
  );
};

export default AdminChatPage;
