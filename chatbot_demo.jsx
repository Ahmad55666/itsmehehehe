import React, { useEffect } from "react";
import Footer from "../components/Footer";
import ChatInterface from "../components/ChatInterface";
import { useRouter } from "next/router";

export default function ChatbotDemo() {
  const router = useRouter();
  
  useEffect(() => {
    // The demo mode is now always active, so no auth check is needed.
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-2">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Chatbot Demo</h1>
        <p className="text-gray-400 mb-8 text-center max-w-lg">
          Try chatting with our emotionally-aware AI sales agent. See how it understands you and guides you to the perfect product!
        </p>
        <div className="w-full max-w-2xl">
          <ChatInterface demoMode={true} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
