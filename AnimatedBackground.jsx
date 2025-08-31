// src/components/AnimatedBackground.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function AnimatedBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    let animationFrameId;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    
    const globes = [];
    const globeGeometry = new THREE.SphereGeometry(2, 32, 32);
    
    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.7,
        emissive: 0x6d28d9
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        emissive: 0x0284c7
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xec4899,
        transparent: true,
        opacity: 0.7,
        emissive: 0xdb2777
      })
    ];
    
    for (let i = 0; i < 5; i++) {
      const material = materials[i % materials.length];
      const globe = new THREE.Mesh(globeGeometry, material);
      
      globe.position.x = (Math.random() - 0.5) * 30;
      globe.position.y = (Math.random() - 0.5) * 20;
      globe.position.z = (Math.random() - 0.5) * 30;
      
      const innerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 32, 32),
        new THREE.MeshBasicMaterial({
          color: material.emissive,
          transparent: true,
          opacity: 0.3
        })
      );
      globe.add(innerGlow);
      
      globe.userData = {
        speed: 0.001 + Math.random() * 0.003,
        rotation: new THREE.Vector3(
          Math.random() * 0.02,
          Math.random() * 0.02,
          Math.random() * 0.02
        )
      };
      
      scene.add(globe);
      globes.push(globe);
    }
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      globes.forEach(globe => {
        globe.rotation.x += globe.userData.rotation.x;
        globe.rotation.y += globe.userData.rotation.y;
        globe.rotation.z += globe.userData.rotation.z;
      });
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    // Add to DOM only if ref exists
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}