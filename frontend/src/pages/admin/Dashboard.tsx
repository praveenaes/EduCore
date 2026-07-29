import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Admin Dashboard</h1>
      <p className="text-sm text-neutral-500">
        Welcome to the administration portal. Use the navigation links in the sidebar to access
        system modules.
      </p>
    </div>
  );
};
export default Dashboard;
