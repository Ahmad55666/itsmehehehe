// src/pages/About.jsx
import React, { useEffect, useRef } from 'react';
import Footer from '../components/Footer';

const About = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let animationFrameId;
    const particles = [];
    const particleCount = 150;
    const colors = ['#8b5cf6', '#6366f1', '#c084fc', '#a78bfa', '#7e22ce'];
    
    // Resize canvas on window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = Math.random() * 0.05;
        this.radius = Math.random() * 80 + 20;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
      }
      
      update() {
        // Orbital movement pattern
        this.angle += this.velocity;
        this.x = this.centerX + Math.cos(this.angle) * this.radius;
        this.y = this.centerY + Math.sin(this.angle) * this.radius;
        
        // Random drift
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Reset particles that go off screen
        if (this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        
        // Draw glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0, 
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, `${this.color}${Math.round(this.alpha * 100).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${this.color}00`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
    
    // Create particles
    const createParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    // Draw connecting lines between particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const opacity = 1 - distance / 150;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw aura center glow
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 300
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      drawConnections();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] to-[#1e293b] overflow-hidden">
      {/* Sophisticated Particle Animation */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none"
      />
      
      {/* Aura Overlay */}
      <div className="aura-overlay"></div>
      
      <main className="flex-1 flex flex-col items-center relative z-10">
        {/* Hero Section */}
        <section className="w-full min-h-screen flex flex-col items-center justify-center px-4 relative">
          <div className="text-center max-w-4xl relative z-10 animate-fade-in">
            <div className="inline-block bg-gradient-to-r from-purple-900 to-cyan-900 p-1 rounded-full mb-8">
              <div className="bg-[#0f172a] rounded-full p-5">
                <div className="text-5xl">🧠</div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              <span className="gradient-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Emotionally Intelligent AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto">
              We're building AI that sells better than humans by understanding psychology
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="#team" 
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-[1.03]"
              >
                Meet the Team
              </a>
              <a 
                href="#cta" 
                className="px-8 py-3 bg-slate-800 rounded-lg font-bold text-white border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Try the Bot
              </a>
            </div>
          </div>
          
          <div className="absolute bottom-10 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>
        
        {/* Our Mission */}
        <section className="w-full py-24 px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Mission</h2>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full mb-8"></div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-8 border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500 rounded-full opacity-10 blur-3xl"></div>
            
            <p className="text-xl md:text-2xl text-slate-300 text-center leading-relaxed">
              "We believe conversations are the most powerful sales tool. That's why we built an AI that doesn't just reply — it understands, persuades, and connects."
            </p>
          </div>
        </section>
        
        {/* What We Do */}
        <section className="w-full py-24 bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">What We Do</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Transforming conversations into conversions with psychological AI</p>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full mt-6"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: '🤖', 
                  title: 'Emotional AI Chatbot', 
                  desc: 'Understands and responds to human emotions for authentic conversations' 
                },
                { 
                  icon: '📲', 
                  title: 'Cross-platform Integration', 
                  desc: 'Seamlessly connects with all your social media and messaging platforms' 
                },
                { 
                  icon: '💰', 
                  title: 'Sales Optimization', 
                  desc: 'Converts 60% more leads by applying psychological principles' 
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/30 transition-all duration-500 card-hover-effect"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Impact / Vision */}
        <section className="w-full py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Our Vision</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-6">
                  We're on a mission to replace robotic chatbots with emotionally aware assistants that generate 70%+ more conversions
                </h3>
                
                <div className="grid grid-cols-2 gap-6 mt-10">
                  {[
                    { value: '1M+', label: 'conversations processed' },
                    { value: '70%', label: 'avg conversion rate' },
                    { value: '12+', label: 'countries served' },
                    { value: '99%', label: 'ad efficiency' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="text-3xl font-bold text-cyan-400 mb-1">{stat.value}</div>
                      <div className="text-slate-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-2xl p-8 border border-slate-700">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-purple-900/30 rounded-full p-4 mb-4">
                      <div className="text-4xl">🚀</div>
                    </div>
                    <h4 className="text-xl font-bold text-white">Built by one founder on a mission</h4>
                  </div>
                  <p className="text-slate-400 text-center">
                    "I started this journey to revolutionize how people sell online. Our AI doesn't just automate conversations - it creates genuine connections that drive results."
                  </p>
                  <div className="mt-6 text-cyan-400 text-center font-semibold">- Alex Morgan, Founder & CEO</div>
                </div>
                
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500 rounded-full opacity-20 blur-xl -z-10"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Where We're Based */}
        <section className="w-full py-24 bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">How We Work</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Globally Distributed Team
                </h3>
                <p className="text-slate-400 mb-4">
                  We're a fully remote team spanning 8 countries, working across time zones to deliver 24/7 innovation.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-800 px-3 py-1 rounded-full text-sm">San Francisco</span>
                  <span className="bg-slate-800 px-3 py-1 rounded-full text-sm">Berlin</span>
                  <span className="bg-slate-800 px-3 py-1 rounded-full text-sm">Singapore</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Modern Work Culture
                </h3>
                <ul className="text-slate-400 space-y-2">
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2">✓</span>
                    <span>Async-first communication</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2">✓</span>
                    <span>Flexible work hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2">✓</span>
                    <span>Quarterly team retreats</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2">✓</span>
                    <span>Continuous learning budget</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="w-full py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Join Our Journey</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Want to partner, invest, or join our mission to revolutionize sales conversations?
            </p>
            
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-8 border border-slate-700 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <a 
                  href="mailto:contact@emotionai.com" 
                  className="group flex flex-col items-center p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all"
                >
                  <div className="text-4xl mb-4 group-hover:text-cyan-400 transition-colors">📩</div>
                  <h3 className="font-bold text-white mb-2">Email Us</h3>
                  <p className="text-sm text-slate-400">contact@emotionai.com</p>
                </a>
                
                <a 
                  href="https://linkedin.com/company/emotionai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all"
                >
                  <div className="text-4xl mb-4 group-hover:text-cyan-400 transition-colors">💼</div>
                  <h3 className="font-bold text-white mb-2">LinkedIn</h3>
                  <p className="text-sm text-slate-400">Connect with us</p>
                </a>
                
                <a 
                  href="/partnerships" 
                  className="group flex flex-col items-center p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all"
                >
                  <div className="text-4xl mb-4 group-hover:text-cyan-400 transition-colors">🤝</div>
                  <h3 className="font-bold text-white mb-2">Partnerships</h3>
                  <p className="text-sm text-slate-400">Explore opportunities</p>
                </a>
              </div>
              
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-[1.03] w-full max-w-xs">
                Try Our Demo
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;