// src/components/Footer.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Footer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 200, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, 200);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 10;
      posArray[i + 1] = (Math.random() - 0.5) * 2;
      posArray[i + 2] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create floating tokens
    const tokenGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
    const tokenMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x60a5fa, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    
    const tokens = [];
    for (let i = 0; i < 20; i++) {
      const token = new THREE.Mesh(tokenGeometry, tokenMaterial);
      token.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 5
      );
      token.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );
      tokens.push(token);
      scene.add(token);
    }

    // Create AI neuron connections
    const neuronGeometry = new THREE.BufferGeometry();
    const neuronCount = 100;
    const neuronPosArray = new Float32Array(neuronCount * 3);
    
    for (let i = 0; i < neuronCount * 3; i += 3) {
      neuronPosArray[i] = (Math.random() - 0.5) * 10;
      neuronPosArray[i + 1] = (Math.random() - 0.5) * 2;
      neuronPosArray[i + 2] = (Math.random() - 0.5) * 10;
    }
    
    neuronGeometry.setAttribute('position', new THREE.BufferAttribute(neuronPosArray, 3));
    const neuronMaterial = new THREE.LineBasicMaterial({ 
      color: 0xec4899, 
      transparent: true,
      opacity: 0.3
    });
    const neuronLines = new THREE.LineSegments(neuronGeometry, neuronMaterial);
    scene.add(neuronLines);

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      // Animate particles
      particlesMesh.rotation.y = elapsedTime * 0.1;
      
      // Animate tokens
      tokens.forEach(token => {
        token.rotation.z += 0.01;
        token.position.add(token.userData.velocity);
        
        // Boundary check
        if (Math.abs(token.position.x) > 4.5) token.userData.velocity.x *= -1;
        if (Math.abs(token.position.y) > 1) token.userData.velocity.y *= -1;
        if (Math.abs(token.position.z) > 4.5) token.userData.velocity.z *= -1;
      });
      
      // Animate neuron connections
      const vertices = neuronGeometry.attributes.position.array;
      for (let i = 0; i < vertices.length; i += 6) {
        vertices[i + 1] = Math.sin(elapsedTime + i) * 0.1;
      }
      neuronGeometry.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / 200;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <footer className="relative w-full bg-gradient-to-b from-gray-900 to-gray-950 pt-12 pb-8 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full opacity-20"
      />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-purple-300 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white font-mono tracking-wider">
                NEXUS_AI
              </h2>
            </div>
            <p className="text-gray-300 max-w-md">
              AI chatbots that understand human psychology to drive engagement and sales.
            </p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="token-badge mr-2">20</div>
              <span className="text-white font-bold">FREE TOKENS</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              No credit card required. Start instantly.
            </p>
            <button className="signup-button">
              Get Started
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Nexus AI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="social-icon">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#" className="social-icon">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
            </a>
            <a href="#" className="social-icon">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Floating AI elements */}
      <div className="absolute bottom-10 left-1/4 w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
      <div className="absolute top-8 right-1/3 w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
    </footer>
  );
}