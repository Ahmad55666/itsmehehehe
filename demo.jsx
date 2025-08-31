// src/pages/demo.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebars';
import ChatInterface from '../components/ChatInterface';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Demo() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] relative">
      <AnimatedBackground />
      <Navbar />
      <Sidebar />
      <main className="ml-64 p-6">
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-4">Chatbot Demo</h1>
          <p className="text-gray-400 mb-6">
            Test your configured chatbot. The AI will use your business settings to respond.
          </p>
          <div className="h-[70vh]">
            <ChatInterface demoMode={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
