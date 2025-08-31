import React, { useRef, useState, useEffect } from "react";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

export default function Contact() {
  const canvasRef = useRef(null);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    interest: "",
    message: ""
  });

  useEffect(() => {
    const initThreeJS = async () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        alpha: true,
        antialias: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Create a massive particle system
      const particlesCount = 8000;
      const positions = new Float32Array(particlesCount * 3);
      const colorsArray = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount; i++) {
        const idx = i * 3;
        // Position particles in a sphere
        const radius = 15 + Math.random() * 25;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
        positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[idx + 2] = radius * Math.cos(phi);
        
        // Color - purple aura gradient
        const hue = 0.75 + Math.random() * 0.15; // Purple to blue
        const saturation = 0.7 + Math.random() * 0.3;
        const lightness = 0.5 + Math.random() * 0.2;
        
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        colorsArray[idx] = color.r;
        colorsArray[idx + 1] = color.g;
        colorsArray[idx + 2] = color.b;
      }
      
      // Create particle system
      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Create floating geometric shapes
      const geometryTypes = [
        () => new THREE.IcosahedronGeometry(2, 0),
        () => new THREE.OctahedronGeometry(2, 0),
        () => new THREE.TorusGeometry(1.5, 0.4, 16, 100),
        () => new THREE.ConeGeometry(1.5, 3, 8)
      ];
      
      const shapes = [];
      for (let i = 0; i < 8; i++) {
        const geoType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
        const geometry = geoType();
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.75 + Math.random() * 0.15, 0.7, 0.6),
          wireframe: true,
          transparent: true,
          opacity: 0.6
        });
        
        const shape = new THREE.Mesh(geometry, material);
        shape.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 40
        );
        
        scene.add(shape);
        shapes.push({
          mesh: shape,
          rotationSpeed: new THREE.Vector3(
            Math.random() * 0.02 - 0.01,
            Math.random() * 0.02 - 0.01,
            Math.random() * 0.02 - 0.01
          )
        });
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
      
      const outputPass = new OutputPass();
      composer.addPass(outputPass);

      camera.position.z = 30;

      // Animation loop
      const clock = new THREE.Clock();
      const animate = () => {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Animate particles
        particles.rotation.x = elapsedTime * 0.01;
        particles.rotation.y = elapsedTime * 0.005;
        
        // Animate shapes
        shapes.forEach((shape, i) => {
          shape.mesh.rotation.x += shape.rotationSpeed.x;
          shape.mesh.rotation.y += shape.rotationSpeed.y;
          shape.mesh.rotation.z += shape.rotationSpeed.z;
          
          // Floating motion
          shape.mesh.position.y = shape.mesh.position.y + Math.sin(elapsedTime * 0.5 + i) * 0.05;
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        interest: "",
        message: ""
      });
    }, 3000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* 3D Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full z-0"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 to-[#121316]/95 z-1"></div>
      
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-24">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="gradient-text bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff]">
                Let's Connect
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Have a question or want to work together? Reach out to our team and we'll get back to you within 24 hours.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="bg-[#1a1c23]/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-[#2d2f3a]"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-400 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">Phone</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Company</label>
                  <input 
                    type="text" 
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">I'm Interested in...</label>
                  <select 
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white" 
                    required
                  >
                    <option value="">Select an option</option>
                    <option>Enterprise Solutions</option>
                    <option>Custom AI Integration</option>
                    <option>Sales Automation</option>
                    <option>Partnership Opportunities</option>
                    <option>Technical Support</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white" 
                    rows={4} 
                    required 
                  />
                </div>
                
                <motion.button
                  className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold px-8 py-4 rounded-lg mt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
                
                {sent && (
                  <motion.div 
                    className="mt-4 p-4 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Message sent! We'll get back to you soon.
                  </motion.div>
                )}
              </form>
            </motion.div>
            
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="bg-[#1a1c23]/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-[#2d2f3a]">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="mr-3">📱</span> Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="text-2xl mr-4">📧</div>
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <a href="mailto:contact@alliancer.com" className="text-[#38b6ff] hover:underline">contact@alliancer.com</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-2xl mr-4">📞</div>
                    <div>
                      <h4 className="font-semibold">Phone</h4>
                      <a href="tel:+11234567890" className="text-[#38b6ff] hover:underline">+1 (123) 456-7890</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-2xl mr-4">🏢</div>
                    <div>
                      <h4 className="font-semibold">Office</h4>
                      <p className="text-gray-300">123 Innovation Drive<br />San Francisco, CA 94107</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1a1c23]/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-[#2d2f3a]">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="mr-3">⏰</span> Business Hours
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-[#38b6ff]">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-[#38b6ff]">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-[#38b6ff]">Closed</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1a1c23]/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-[#2d2f3a]">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="mr-3">🔗</span> Connect With Us
                </h3>
                
                <div className="flex space-x-4">
                  {['Twitter', 'LinkedIn', 'Instagram', 'Facebook'].map((platform, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      className="w-12 h-12 rounded-full bg-[#161b20] flex items-center justify-center text-xl hover:bg-[#38b6ff] transition"
                      whileHover={{ y: -5 }}
                    >
                      {platform === 'Twitter' ? '🐦' : 
                       platform === 'LinkedIn' ? '👔' : 
                       platform === 'Instagram' ? '📸' : '👍'}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}