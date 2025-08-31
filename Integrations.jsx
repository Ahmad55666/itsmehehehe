import React, { useState, useEffect } from 'react';
import axios from 'axios';

const socialPlatforms = [
  { name: 'Facebook', apiName: 'facebook', logo: '/path/to/facebook-logo.png' },
  { name: 'Instagram', apiName: 'instagram', logo: '/path/to/instagram-logo.png' },
  { name: 'TikTok', apiName: 'tiktok', logo: '/path/to/tiktok-logo.png' },
  { name: 'WhatsApp', apiName: 'whatsapp', logo: '/path/to/whatsapp-logo.png' },
];

const Integrations = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  useEffect(() => {
    // Fetch the user's connected platforms from the backend
    const fetchConnectedPlatforms = async () => {
      try {
        const response = await axios.get('/api/integrations/status', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setConnectedPlatforms(response.data.connected_platforms);
      } catch (error) {
        console.error('Error fetching integration status:', error);
      }
    };
    fetchConnectedPlatforms();
  }, []);

  const handleConnect = (platform) => {
    window.location.href = `/api/integrations/${platform}/connect`;
  };

  const handleDisconnect = async (platform) => {
    try {
      await axios.post(`/api/integrations/${platform}/disconnect`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setConnectedPlatforms(connectedPlatforms.filter((p) => p !== platform));
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {socialPlatforms.map((platform) => {
        const isConnected = connectedPlatforms.includes(platform.apiName);
        return (
          <div key={platform.name} className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center">
              <img src={platform.logo} alt={`${platform.name} logo`} className="h-10 w-10 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">{platform.name}</h3>
                <p className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? '✅ Connected' : '❌ Not Connected'}
                </p>
              </div>
            </div>
            {isConnected ? (
              <button
                onClick={() => handleDisconnect(platform.apiName)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect(platform.apiName)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Connect
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Integrations;
