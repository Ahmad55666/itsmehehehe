import React, { useState, useRef, useEffect } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function Pricing() {
  const canvasRef = useRef(null);
  const [sliderValues, setSliderValues] = useState({
    chatMessages: 100,
    sales: 30,
    leads: 20,
    teamMembers: 3
  });
  
  const calculateCost = () => {
    const { chatMessages, sales, leads, teamMembers } = sliderValues;
    
    // Calculate token usage
    const chatTokens = 5 * chatMessages * 30 * teamMembers; // 5 tokens per message, 30 days
    const salesTokens = 20 * sales; // 20 tokens per sale
    const leadsTokens = 40 * leads; // 40 tokens per lead
    
    const totalTokens = chatTokens + salesTokens + leadsTokens;
    
    // Calculate cost based on token volume
    let cost = 0;
    if (totalTokens <= 100) {
      cost = totalTokens * 0.06; // $0.06 per token
    } else if (totalTokens <= 500) {
      cost = totalTokens * 0.05; // $0.05 per token
    } else {
      cost = totalTokens * 0.045; // $0.045 per token
    }
    
    return {
      tokens: totalTokens,
      cost: Math.round(cost)
    };
  };
  
  const { tokens, cost } = calculateCost();
  
  const handleSliderChange = (e, key) => {
    setSliderValues({
      ...sliderValues,
      [key]: parseInt(e.target.value)
    });
  };

  useEffect(() => {
    const initThreeJS = async () => {
      const THREE = await import('three');
      const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
      const { ShaderPass } = await import('three/addons/postprocessing/ShaderPass.js');
      const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');
      const { FilmPass } = await import('three/addons/postprocessing/FilmPass.js');
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        alpha: true,
        antialias: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Particle system
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = 2000;
      const posArray = new Float32Array(particleCount * 3);
      
      for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: new THREE.Color("#8b5cf6"),
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      // Light pillars
      const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 32);
      const pillars = [];
      for(let i = 0; i < 8; i++) {
        const pillarMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#6366f1"),
          transparent: true,
          opacity: 0.7
        });
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.x = (Math.random() - 0.5) * 8;
        pillar.position.y = -1.5;
        pillar.position.z = -5;
        pillar.rotation.x = Math.PI / 2;
        scene.add(pillar);
        pillars.push(pillar);
      }

      // Bloom effect
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
      );
      composer.addPass(bloomPass);
      
      // Film grain effect
      const filmPass = new FilmPass(0.35, 0.025, 2048, false);
      composer.addPass(filmPass);

      camera.position.z = 5;

      // Animation loop
      const clock = new THREE.Clock();
      const animate = () => {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Animate particles
        particlesMesh.rotation.x = elapsedTime * 0.05;
        particlesMesh.rotation.y = elapsedTime * 0.03;
        
        // Animate pillars
        pillars.forEach((pillar, i) => {
          pillar.position.y = -1.5 + Math.sin(elapsedTime * 2 + i) * 0.5;
          pillar.scale.y = 0.8 + Math.sin(elapsedTime * 3 + i) * 0.2;
        });

        composer.render();
      };
      
      animate();
      
      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      };
    };

    initThreeJS();
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* 3D Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full z-0"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 to-[#121316]/95 z-1"></div>
      
      <div className="relative z-10">
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 text-center neon-text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="gradient-text bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff]">
              Token-Based Pricing
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 text-center max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Pay only for what you use. No monthly fees, no contracts. 
            <span className="block mt-2 text-[#38b6ff] font-semibold">
              Get 10 free tokens when you sign up!
            </span>
          </motion.p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full">
            {/* Token Package Card */}
            <motion.div
              className="bg-[#1a1c23] rounded-2xl shadow-xl p-8 flex flex-col items-center border border-[#2d2f3a] card-hover-effect"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className="mb-6 relative">
                <div className="absolute -inset-4 bg-[#8b5cf6] rounded-full blur-xl opacity-30"></div>
                <span className="text-6xl font-bold text-[#38b6ff]">100</span>
                <span className="ml-2 text-2xl font-bold text-white">tokens</span>
              </div>
              <div className="mb-2 text-3xl font-bold text-white">$6</div>
              <div className="text-gray-400 mb-8 flex-grow">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#38b6ff] mr-3"></div>
                  <span>5 tokens per chat message</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-3"></div>
                  <span>20 tokens per sale</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#6366f1] mr-3"></div>
                  <span>40 tokens per lead saved</span>
                </div>
              </div>
              <motion.a
                href="/dashboard"
                className="mt-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold shadow-lg w-full text-center glow-purple"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.a>
            </motion.div>
            
            {/* Popular Package */}
            <motion.div
              className="bg-gradient-to-br from-[#1a1c23] to-[#121420] rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 border-[#6366f1] relative card-hover-effect"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#6366f1] text-white px-6 py-1 rounded-full font-bold tracking-wide">
                MOST POPULAR
              </div>
              <div className="mb-6 relative">
                <div className="absolute -inset-4 bg-[#6366f1] rounded-full blur-xl opacity-40"></div>
                <span className="text-6xl font-bold text-white">500</span>
                <span className="ml-2 text-2xl font-bold text-[#38b6ff]">tokens</span>
              </div>
              <div className="mb-2 text-3xl font-bold text-white">$25 <span className="text-lg text-gray-400">(Save 17%)</span></div>
              <div className="text-gray-400 mb-8 flex-grow">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#38b6ff] mr-3"></div>
                  <span>All Basic features</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-3"></div>
                  <span>Priority support</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#6366f1] mr-3"></div>
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#9d4edd] mr-3"></div>
                  <span>+50 bonus tokens</span>
                </div>
              </div>
              <motion.a
                href="/dashboard"
                className="mt-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38b6ff] text-white font-bold shadow-lg w-full text-center glow-purple"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Premium
              </motion.a>
            </motion.div>
            
            {/* Enterprise Package */}
            <motion.div
              className="bg-[#1a1c23] rounded-2xl shadow-xl p-8 flex flex-col items-center border border-[#2d2f3a] card-hover-effect"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
            >
              <div className="mb-6 relative">
                <div className="absolute -inset-4 bg-[#38b6ff] rounded-full blur-xl opacity-30"></div>
                <span className="text-6xl font-bold text-[#8b5cf6]">2000</span>
                <span className="ml-2 text-2xl font-bold text-white">tokens</span>
              </div>
              <div className="mb-2 text-3xl font-bold text-white">$90 <span className="text-lg text-gray-400">(Save 25%)</span></div>
              <div className="text-gray-400 mb-8 flex-grow">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#38b6ff] mr-3"></div>
                  <span>All Premium features</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-3"></div>
                  <span>Dedicated account manager</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#6366f1] mr-3"></div>
                  <span>Custom integrations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#9d4edd] mr-3"></div>
                  <span>+200 bonus tokens</span>
                </div>
              </div>
              <motion.a
                href="/dashboard"
                className="mt-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#9d4edd] to-[#38b6ff] text-white font-bold shadow-lg w-full text-center glow-purple"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Go Enterprise
              </motion.a>
            </motion.div>
          </div>
          
          {/* Token Usage Calculator */}
          <motion.div
            className="mt-16 bg-[#1a1c23] rounded-2xl shadow-xl p-8 max-w-4xl w-full border border-[#2d2f3a]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center gradient-text bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff]">
              Token Usage Calculator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-gray-400">Daily Chat Messages</label>
                    <span className="text-[#38b6ff] font-semibold">{sliderValues.chatMessages}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    value={sliderValues.chatMessages}
                    onChange={(e) => handleSliderChange(e, 'chatMessages')}
                    className="w-full accent-[#8b5cf6]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0</span>
                    <span>500</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-gray-400">Estimated Sales/Month</label>
                    <span className="text-[#38b6ff] font-semibold">{sliderValues.sales}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={sliderValues.sales}
                    onChange={(e) => handleSliderChange(e, 'sales')}
                    className="w-full accent-[#6366f1]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0</span>
                    <span>200</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-gray-400">Leads Saved/Month</label>
                    <span className="text-[#38b6ff] font-semibold">{sliderValues.leads}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderValues.leads}
                    onChange={(e) => handleSliderChange(e, 'leads')}
                    className="w-full accent-[#9d4edd]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-gray-400">Team Members</label>
                    <span className="text-[#38b6ff] font-semibold">{sliderValues.teamMembers}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={sliderValues.teamMembers}
                    onChange={(e) => handleSliderChange(e, 'teamMembers')}
                    className="w-full accent-[#38b6ff]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
              <motion.div 
                className="bg-[#232c34] rounded-xl p-6 flex flex-col items-center justify-center"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                key={`${cost}-${tokens}`}
              >
                <div className="text-gray-400 mb-2">Estimated Monthly Cost</div>
                <motion.div 
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ${cost}
                </motion.div>
                <motion.div 
                  className="text-[#38b6ff] font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  ({tokens.toLocaleString()} tokens)
                </motion.div>
                <div className="mt-4 text-center text-gray-400 text-sm">
                  Based on your usage patterns
                </div>
                <div className="mt-4 w-full bg-[#2d2f3a] rounded-full h-2.5">
                  <motion.div 
                    className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (tokens / 5000) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Token usage: {tokens.toLocaleString()} / 5000
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
  );
}