import React, { useState } from 'react';
import Integrations from '../components/Integrations';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'integrations' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'billing' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
      </div>
      <div className="mt-6">
        {activeTab === 'profile' && <div>Profile Settings</div>}
        {activeTab === 'integrations' && <Integrations />}
        {activeTab === 'billing' && <div>Billing Settings</div>}
      </div>
    </div>
  );
};

export default Settings;
