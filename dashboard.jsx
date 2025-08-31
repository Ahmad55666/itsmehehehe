// src/pages/dashboard.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebars";
import TokenMeter from "../components/TokenMeter";
import TokenLogTable from "../components/TokenLogTable";
import LeadTable from "../components/LeadTable";
import AnimatedBackground from "../components/AnimatedBackground";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "../lib/auth";

export default function Dashboard() {
  const [tokens, setTokens] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [business, setBusiness] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    autoVerifyActive: false,
    bypassEnabled: false,
    loading: true
  });
  const router = useRouter();
  const { user, logout } = useUser();

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('/api/auth/debug/status');
        if (response.ok) {
          const data = await response.json();
          setSystemStatus({
            autoVerifyActive: data.auto_verify_enabled,
            bypassEnabled: data.bypass_enabled,
            loading: false
          });
        } else {
          setSystemStatus({
            autoVerifyActive: false,
            bypassEnabled: false,
            loading: false
          });
        }
      } catch (error) {
        console.error("System status check failed:", error);
        setSystemStatus({
          autoVerifyActive: false,
          bypassEnabled: false,
          loading: false
        });
      }
    };
    
    checkSystemStatus();
  }, []);

  useEffect(() => {
    if (!user || systemStatus.loading) {
      return;
    }

    const isEffectivelyVerified = user.is_verified || 
                                 systemStatus.autoVerifyActive || 
                                 systemStatus.bypassEnabled;

    if (!systemStatus.autoVerifyActive && !systemStatus.bypassEnabled && !user.is_verified) {
      router.push("/verify-email");
      return;
    }

    const fetchData = async () => {
      try {
        const tokenRes = await fetch("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!tokenRes.ok) throw new Error("Failed to fetch user data");
        const tokenData = await tokenRes.json();
        setTokens(tokenData.tokens);
        setBusiness(tokenData.business);

        const txRes = await fetch("http://localhost:8000/api/token/history", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!txRes.ok) throw new Error("Failed to fetch transactions");
        const txData = await txRes.json();
        setTransactions(txData);

        const leadsRes = await fetch("http://localhost:8000/api/leads", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!leadsRes.ok) throw new Error("Failed to fetch leads");
        const leadsData = await leadsRes.json();
        setLeads(leadsData);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      }
    };

    fetchData();
  }, [user, router, systemStatus]);

  if (systemStatus.loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] relative">
      <AnimatedBackground />
      <Navbar />
      <Sidebar />
      
      {(systemStatus.autoVerifyActive || systemStatus.bypassEnabled) && (
        <div className="bg-yellow-900/30 border border-yellow-700 p-3 text-center">
          <span className="text-yellow-400">⚠️ DEVELOPMENT MODE:</span>
          <span className="text-yellow-300 ml-2">
            {systemStatus.autoVerifyActive && "Auto-verify active"}
            {systemStatus.autoVerifyActive && systemStatus.bypassEnabled && " & "}
            {systemStatus.bypassEnabled && "Verification bypass enabled"}
          </span>
        </div>
      )}
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="ml-64 p-6"
      >
        {business && (
          <h1 className="text-3xl font-bold text-white mb-4">
            {business.name} Dashboard
          </h1>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6"
            whileHover={{ y: -5 }}
          >
            <h2 className="text-xl font-bold mb-4">Token Balance</h2>
            <div className="flex items-center justify-between">
              <TokenMeter tokens={tokens} onBuyClick={() => router.push('/checkout')} />
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-6"
            whileHover={{ y: -5 }}
          >
            <h2 className="text-xl font-bold mb-4">Usage Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Chats Today</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <div>
                <p className="text-gray-400">Leads Captured</p>
                <p className="text-3xl font-bold">{leads.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/50 border border-green-500/30 rounded-xl p-6"
            whileHover={{ y: -5 }}
          >
            <h2 className="text-xl font-bold mb-4">AI Performance</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Conversion Rate</p>
                <p className="text-3xl font-bold">42%</p>
              </div>
              <div>
                <p className="text-gray-400">Avg. Response Time</p>
                <p className="text-3xl font-bold">1.2s</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <motion.section 
            className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Token History</h2>
              <button 
                onClick={() => router.push('/checkout')}
                className="px-3 py-1 bg-purple-600 text-sm rounded"
              >
                Buy More
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <TokenLogTable transactions={transactions} />
            </div>
          </motion.section>
          
          <motion.section
            className="bg-gray-800/50 border border-green-500/30 rounded-xl p-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">Captured Leads</h2>
            <div className="max-h-96 overflow-y-auto">
              <LeadTable leads={leads} />
            </div>
          </motion.section>
        </div>
      </motion.main>
    </div>
  );
}
