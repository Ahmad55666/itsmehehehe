import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export default function LuxuryAuthBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Bloom effect with luxury settings
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.8, 0.6, 0.85
    );
    composer.addPass(bloomPass);

    // Luxury lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x8b5cf6, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x38b6ff, 2, 50);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Create gem geometries programmatically instead of loading models
    const createGem = (position, scale, colorHex) => {
      // Create a more complex gem shape using multiple geometries
      const group = new THREE.Group();
      
      // Main diamond shape (octahedron)
      const geometry = new THREE.OctahedronGeometry(1, 1);
      const material = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transmission: 0.9,
        opacity: 0.95,
        transparent: true,
        emissive: new THREE.Color(colorHex).multiplyScalar(0.3),
        emissiveIntensity: 0.3
      });
      
      const mainGem = new THREE.Mesh(geometry, material);
      group.add(mainGem);
      
      // Add inner facets for more detail
      const innerGeometry = new THREE.OctahedronGeometry(0.7, 0);
      const innerMaterial = material.clone();
      innerMaterial.emissiveIntensity = 0.5;
      const innerGem = new THREE.Mesh(innerGeometry, innerMaterial);
      group.add(innerGem);
      
      // Add sparkles
      const sparkleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
      const sparkleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      
      // Create multiple sparkles at vertices
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        const x = geometry.attributes.position.getX(i);
        const y = geometry.attributes.position.getY(i);
        const z = geometry.attributes.position.getZ(i);
        sparkle.position.set(x * 1.1, y * 1.1, z * 1.1);
        group.add(sparkle);
      }
      
      group.position.set(position.x, position.y, position.z);
      group.scale.set(scale, scale, scale);
      group.rotation.x = Math.random() * Math.PI;
      group.rotation.y = Math.random() * Math.PI;
      
      scene.add(group);
      
      return {
        mesh: group,
        rotationSpeed: new THREE.Vector3(
          Math.random() * 0.005,
          Math.random() * 0.005,
          Math.random() * 0.005
        )
      };
    };

    // Create gems at predefined positions
    const gems = [];
    const gemPositions = [
      { x: -8, y: -3, z: -15, scale: 0.8, color: 0x8b5cf6 },
      { x: 7, y: 2, z: -20, scale: 1.2, color: 0x38b6ff },
      { x: -5, y: 5, z: -25, scale: 0.7, color: 0x8b5cf6 }
    ];
    
    gemPositions.forEach(pos => {
      gems.push(createGem(pos, pos.scale, pos.color));
    });

    // Luxury particle system - reduced to 3000 particles
    const particlesCount = 3000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i += 3) {
      // Positions
      posArray[i] = (Math.random() - 0.5) * 50;
      posArray[i+1] = (Math.random() - 0.5) * 50;
      posArray[i+2] = (Math.random() - 0.5) * 50;
      
      // Colors - purple-blue gradient
      const color = new THREE.Color();
      const mix = Math.random();
      color.lerpColors(
        new THREE.Color(0x8b5cf6), 
        new THREE.Color(0x38b6ff), 
        mix
      );
      colorArray[i] = color.r;
      colorArray[i+1] = color.g;
      colorArray[i+2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Luxury animated text
    const createText = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      // Gradient text
      const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#38b6ff');
      
      context.fillStyle = gradient;
      context.font = 'bold 80px "Arial", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('PREMIUM', canvas.width/2, canvas.height/2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.1
      });
      
      const geometry = new THREE.PlaneGeometry(20, 5);
      const textMesh = new THREE.Mesh(geometry, material);
      textMesh.position.set(0, 0, -30);
      scene.add(textMesh);
      
      return textMesh;
    };
    
    const textMesh = createText();

    camera.position.z = 25;

    // Animation loop with luxury movements
    const clock = new THREE.Clock();
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      // Animate gems
      gems.forEach(gem => {
        gem.mesh.rotation.x += gem.rotationSpeed.x;
        gem.mesh.rotation.y += gem.rotationSpeed.y;
        gem.mesh.rotation.z += gem.rotationSpeed.z;
        
        // Gentle floating motion
        gem.mesh.position.y = gem.mesh.position.y + Math.sin(elapsedTime * 0.5 + gem.mesh.id) * 0.005;
      });
      
      // Animate particles
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.y += 0.0005;
      
      // Animate text
      if (textMesh) {
        textMesh.rotation.y = elapsedTime * 0.1;
        textMesh.material.opacity = 0.05 + (Math.sin(elapsedTime) * 0.05);
      }
      
      // Animate lights
      pointLight.position.x = Math.sin(elapsedTime * 0.3) * 10;
      pointLight.position.y = Math.cos(elapsedTime * 0.2) * 5;
      
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
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Clean up resources
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
}