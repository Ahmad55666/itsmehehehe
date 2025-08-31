import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface({ demoMode }) {
  const [businessConfig, setBusinessConfig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(demoMode ? "Free" : 0);
  const [showBuy, setShowBuy] = useState(false);
  const [inactive, setInactive] = useState(false);
  const chatRef = useRef();
  const inactivityTimeout = useRef();
  const TENANT_ID = "demo_tenant"; // In a real multi-tenant app, this would be dynamic
  const CHAT_MEMORY_KEY = `chat_memory_${TENANT_ID}`;
  const MAX_MEMORY_BYTES = 10 * 1024 * 1024; // 10MB

  // Load messages from local storage on initial render
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(CHAT_MEMORY_KEY);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([{ sender: "bot", text: "Hi! 👋 What brings you here today?" }]);
      }
    } catch (error) {
      console.error("Failed to load messages from local storage:", error);
      setMessages([{ sender: "bot", text: "Hi! 👋 What brings you here today?" }]);
    }
  }, []);

  // Save messages to local storage and check memory usage
  useEffect(() => {
    try {
      const messagesJson = JSON.stringify(messages);
      const memoryUsage = new Blob([messagesJson]).size;

      if (memoryUsage > MAX_MEMORY_BYTES) {
        alert("Chat memory is full. The chat history will be cleared.");
        handleClearMemory();
      } else {
        localStorage.setItem(CHAT_MEMORY_KEY, messagesJson);
      }
    } catch (error) {
      console.error("Failed to save messages to local storage:", error);
    }
  }, [messages]);

  const handleClearMemory = () => {
    localStorage.removeItem(CHAT_MEMORY_KEY);
    setMessages([{ sender: "bot", text: "Chat history cleared." }]);
  };

  useEffect(() => {
    const fetchBusinessConfig = async () => {
      try {
        const response = await fetch('/api/business-config');
        const data = await response.json();
        setBusinessConfig(data);
      } catch (error) {
        console.error('Failed to fetch business config:', error);
      }
    };

    if (!demoMode) {
      fetchBusinessConfig();
    }
  }, [demoMode]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => setInactive(true), 40000);
    return () => clearTimeout(inactivityTimeout.current);
  }, [messages]);

  useEffect(() => {
    if (demoMode) {
      setTokens("Free");
    } else {
      const fetchTokenBalance = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const token = localStorage.getItem("token");
          if (!user || !token) return;
          
          const response = await fetch("/api/token/balance", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            setTokens(data.tokens);
          }
        } catch (error) {
          console.error("Error fetching token balance:", error);
        }
      };
      
      fetchTokenBalance();
    }
  }, [demoMode]);

  const deductTokens = async (amount) => {
    if (demoMode) return;
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!user || !token) return;
      
      const response = await fetch("/api/token/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Token deduction failed');
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${text.slice(0, 100)}`);
        }
      }
      
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error("Token deduction failed:", error);
      throw error;
    }
  };

  const send = async e => {
    e.preventDefault();
    setInactive(false);
    if (!input.trim() || loading) return;

    if (!demoMode && tokens < 5) {
      setShowBuy(true);
      setInput("");
      return;
    }

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (!demoMode) {
        await deductTokens(5);
      }

      let response, visual, contact, showContact, socialProof;

      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          history: demoMode ? newMessages : [], // Send history in demo mode
          demo_mode: demoMode,
          business_id: user?.business_id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        response = data.response;
        visual = data.visual_url;
        contact = {
          whatsapp: data.contact_whatsapp,
          phone: data.contact_phone
        };
        showContact = data.show_contact;
        if (/a lot of people love/i.test(response)) socialProof = true;
      } else {
        const errorData = await res.json();
        response = errorData.detail || "Sorry, something went wrong.";
        if (res.status === 402) setShowBuy(true);
      }

      setMessages(msgs => [
        ...msgs,
        {
          sender: "bot",
          text: response,
          visual,
          contact,
          showContact,
          socialProof
        }
      ]);
    } catch (err) {
      console.error("API call failed:", err);
      setMessages(msgs => [
        ...msgs,
        { sender: "bot", text: "Sorry, something went wrong. Please try again." }
      ]);
    }
    
    setInput("");
    setLoading(false);
  };

  const handleBuy = () => {
    setTimeout(() => {
      setTokens(t => t + 100);
      setShowBuy(false);
      setMessages(msgs => [
        ...msgs,
        { sender: "bot", text: "✅ 100 tokens credited! You can continue chatting now." }
      ]);
    }, 1200);
  };

  return (
    <div className="bg-[#232c34] rounded-xl shadow-xl p-6 flex flex-col h-[500px] relative">
      <div className="absolute right-4 top-0 z-30 flex items-center gap-2 py-1 px-4 bg-gradient-to-r from-[#38b6ff] to-[#1dd1a1] rounded-b-xl text-white font-bold shadow mb-2">
        <span className="text-lg">🪙</span>
        <span>{tokens}{!demoMode && " tokens"}</span>
      </div>
      
      {demoMode && (
        <div className="absolute left-4 top-2 z-30">
          <button
            onClick={handleClearMemory}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-600 transition"
          >
            Clear Memory
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-2" ref={chatRef}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <div
              className={`rounded-2xl px-5 py-3 max-w-xs ${
                m.sender === "bot"
                  ? "bg-gradient-to-r from-[#38b6ff2e] to-[#1dd1a166] text-white"
                  : "bg-[#38b6ff] text-white"
              }`}
            >
              <span>{m.text}</span>
              {m.visual && (
                <div className="mt-3">
                  {m.visual.endsWith(".mp4") ? (
                    <video
                      src={m.visual}
                      controls
                      className="rounded-lg w-full max-h-40 shadow"
                    />
                  ) : (
                    <img
                      src={m.visual}
                      className="rounded-lg w-full max-h-40 shadow"
                      alt="Product visual"
                    />
                  )}
                </div>
              )}
              {m.showContact && (
                <div className="mt-3 flex flex-col gap-2">
                  {m.contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${m.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-green-500 text-white font-bold shadow hover:scale-105 transition"
                    >
                      <span>WhatsApp</span>
                      <span role="img" aria-label="whatsapp">💬</span>
                    </a>
                  )}
                  {m.contact?.phone && (
                    <a
                      href={`tel:${m.contact.phone}`}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-blue-500 text-white font-bold shadow hover:scale-105 transition"
                    >
                      <span>Call</span>
                      <span role="img" aria-label="phone">📞</span>
                    </a>
                  )}
                </div>
              )}
              {m.socialProof && (
                <div className="mt-2 text-yellow-300 font-bold text-xs">⭐ Social Proof: This product is loved by many!</div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl px-5 py-3 bg-[#38b6ff2e] text-white animate-pulse">Typing...</div>
          </motion.div>
        )}
        {inactive && !loading && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mt-4 px-4 py-2 rounded-xl bg-[#ffd200] text-black font-bold shadow">Still there? Your chatbot is waiting to help! 😊</div>
          </motion.div>
        )}
      </div>
      <form onSubmit={send} className="flex mt-2">
        <input
          className="flex-1 px-4 py-3 rounded-l-lg bg-[#161b20] text-white"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-gradient-to-r from-[#38b6ff] to-[#1dd1a1] px-6 py-3 rounded-r-lg text-white font-bold hover:scale-105 transition"
          disabled={loading}
        >
          Send
        </button>
      </form>
      {showBuy && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center">
          <motion.div
            className="bg-[#232c34] rounded-xl p-6 shadow-2xl text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-xl font-bold mb-2">Out of tokens</div>
            <div className="mb-4">You need more tokens to keep chatting.</div>
            <button
              className="3d-btn px-6 py-2 text-white font-bold rounded-xl"
              onClick={handleBuy}
            >
              Buy 100 tokens (Test)
            </button>
            <div>
              <button className="mt-4 underline text-gray-400" onClick={() => setShowBuy(false)}>Cancel</button>
            </div>
            <style>{`
              .3d-btn {
                background: linear-gradient(90deg,#38b6ff,#1dd1a1);
                box-shadow: 0 4px 18px #38b6ff33, 0 2px 2px #1dd1a166;
                transition: box-shadow .2s, transform .2s;
                border: none;
              }
              .3d-btn:active { transform: scale(0.97); box-shadow: 0 0 0 #0000; }
            `}</style>
          </motion.div>
        </div>
      )}
    </div>
  );
}
