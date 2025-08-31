import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Footer from '../components/Footer';
import Spline from '@splinetool/react-spline';
import * as THREE from 'three';
import { SRGBColorSpace } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';


// Dynamic imports for better performance
const FloatingParticles = dynamic(() => import('../components/FloatingParticles'), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const targetRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const splineContainerRef = useRef(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const webglRef = useRef(null);





  // Parallax effects
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Navbar scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsNavVisible(currentScroll < 100 || currentScroll < window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Purple aura color palette
  const colors = [
    new THREE.Color(0x8a2be2), // Purple
    new THREE.Color(0x9400d3), // Dark violet
    new THREE.Color(0x9932cc), // Dark orchid
    new THREE.Color(0xba55d3), // Medium orchid
    new THREE.Color(0x9370db), // Medium purple
    new THREE.Color(0x7b68ee)  // Medium slate blue
  ];

  // Initialize WebGL background
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace
    webglRef.current.appendChild(renderer.domElement);

    // Post-processing setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom effect for the aura
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);
    
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Create a massive particle system
    const particlesCount = 15000; // Reduced for performance
    const positions = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const velocities = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      // Position particles in a sphere
      const radius = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const idx = i * 3;
      positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[idx + 2] = radius * Math.cos(phi);
      
      // Velocity - random direction with slight inward bias
      velocities[idx] = (Math.random() - 0.5) * 0.2;
      velocities[idx + 1] = (Math.random() - 0.5) * 0.2;
      velocities[idx + 2] = (Math.random() - 0.5) * 0.2 - 0.1; // inward bias
      
      // Color - purple aura gradient
      const colorIdx = Math.floor(Math.random() * colors.length);
      const color = colors[colorIdx];
      colorsArray[idx] = color.r;
      colorsArray[idx + 1] = color.g;
      colorsArray[idx + 2] = color.b;
      
      // Size
      sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom shader material for particles
    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.5 }
      },
      vertexShader: `
        uniform float time;
        uniform float intensity;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * intensity;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 uv = gl_PointCoord.xy - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;
          
          // Create a glowing effect
          float alpha = smoothstep(0.5, 0.0, dist);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Create a dark energy vortex at the center
    const vortexGeometry = new THREE.TorusGeometry(5, 1.5, 32, 100);
    const vortexMaterial = new THREE.MeshBasicMaterial({
      color: 0x4b0082, // Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial);
    scene.add(vortex);
    
    // Add subtle lighting
    const ambientLight = new THREE.AmbientLight(0x663399, 0.3);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x9370db, 1.5, 100);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    
    camera.position.z = 40;
    
    // Animation loop
    const clock = new THREE.Clock();
    let frameId = null;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      particlesMaterial.uniforms.time.value = elapsedTime;
      
      // Update particles
      const positions = particlesGeometry.attributes.position.array;
      const velocitiesArr = velocities;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Move particles
        positions[i] += velocitiesArr[i] * 0.2;
        positions[i + 1] += velocitiesArr[i + 1] * 0.2;
        positions[i + 2] += velocitiesArr[i + 2] * 0.2;
        
        // Attract particles to the center
        const dx = -positions[i];
        const dy = -positions[i + 1];
        const dz = -positions[i + 2];
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Apply stronger attraction when farther away
        const attraction = Math.min(0.0005 * distance * distance, 0.05);
        positions[i] += dx * attraction;
        positions[i + 1] += dy * attraction;
        positions[i + 2] += dz * attraction;
        
        // If particle is too close to center, reset it to outer sphere
        if (distance < 5) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = 40 + Math.random() * 10;
          
          positions[i] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i + 2] = radius * Math.cos(phi);
        }
      }
      
      particlesGeometry.attributes.position.needsUpdate = true;
      
      // Animate vortex
      vortex.rotation.x = elapsedTime * 0.2;
      vortex.rotation.y = elapsedTime * 0.3;
      vortex.scale.set(1 + Math.sin(elapsedTime) * 0.1, 1 + Math.cos(elapsedTime) * 0.1, 1);
      
      // Animate light intensity
      particlesMaterial.uniforms.intensity.value = 1.2 + Math.sin(elapsedTime) * 0.3;
      
      // Render with post-processing
      composer.render();
    };
    
    // Start animation only when in viewport
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animate();
          } else if (frameId) {
            cancelAnimationFrame(frameId);
            frameId = null;
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(webglRef.current);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId) cancelAnimationFrame(frameId);
      if (webglRef.current) {
        webglRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      observer.disconnect();
    };
  }, []);



    // Spline scene interaction state
  const [spline, setSpline] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Handle mouse events for Spline interaction
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !spline) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.005,
      y: prev.y + deltaX * 0.005
    }));
    
    setStartX(e.clientX);
    setStartY(e.clientY);
    
    // Apply rotation to Spline scene
    spline.setZoom(scale);
    spline.setRotation(rotation.x, rotation.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(scale + e.deltaY * -0.001, 0.5), 2);
    setScale(newScale);
    if (spline) spline.setZoom(newScale);
  };

  // Enhanced watermark removal
  const removeWatermarks = () => {
    try {
      // Remove Spline watermark
      setTimeout(() => {
        const watermarks = document.querySelectorAll('.spline-watermark, .Logo');
        watermarks.forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
        
        // Remove via shadow DOM if needed
        const splineViewer = document.querySelector('spline-viewer');
        if (splineViewer && splineViewer.shadowRoot) {
          const shadowElements = splineViewer.shadowRoot.querySelectorAll('.logo, .watermark');
          shadowElements.forEach(el => el.remove());
        }
      }, 1000);
    } catch (e) {
      console.warn('Watermark removal error:', e);
    }
  };



  return (
    <div ref={targetRef} className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Elements */}
      <FloatingParticles count={30} />
      
      {/* WebGL Background */}
      <div ref={webglRef} className="fixed top-0 left-0 -z-10 w-full h-full opacity-40 pointer-events-none" />
      
      {/* Purple Aura Overlay */}
      <div className="aura-overlay"></div>
      
   {/* Hero section */}
        <motion.div 
        className="relative h-[115vh] w-full"
        style={{ y }}
      >
        <div 
          className="absolute inset-0 overflow-hidden cursor-grab"
          ref={splineContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
         onWheel={(e) => {window.scrollBy({ top: e.deltaY * 1.3, behavior: 'auto' });}}

          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {!splineLoaded && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="animate-pulse text-xl">Loading immersive experience...</div>
            </div>
          )}
          
          <Spline
            scene="https://prod.spline.design/O7za5h5KFL4M4hUn/scene.splinecode"
            style={{
              width: '150%',
              height: '120%',
              position: 'absolute',
              left: '-25.5%',
              top: '-10.5%',
              pointerEvents: 'auto',
              visibility: splineLoaded ? 'visible' : 'hidden',
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-out'
            }}
            onLoad={(splineApp) => {
              setSplineLoaded(true);
              setSpline(splineApp);
              
              // Enhanced watermark removal
              removeWatermarks();
              
              // Set up periodic checks
              const interval = setInterval(removeWatermarks, 2000);
              return () => clearInterval(interval);
            }}
            onError={(error) => {
              console.error('Spline error:', error);
              setSplineLoaded(false);
            }}
          />
        </div>
      </motion.div>


                      {/* Solutions Section */}
      
{/* Replace the existing Solutions section with this code */}
<section className="relative py-32 overflow-hidden">
  {/* Gradient aura background */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e1a] via-[#1c1247] to-[#0a0a1f] z-0"></div>
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(138,43,226,0.15)_0%,transparent_70%)] z-0"></div>
  
  <div className="container mx-auto px-6 relative z-10">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-5xl font-bold mb-20 text-center"
    >
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] via-[#5B2EFF] to-[#4EC7F0]">
        Solutions for Every Business
        <motion.span 
          className="absolute ml-2"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.span>
      </span>
    </motion.h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {[
        { 
          title: "Social Selling", 
          description: "Engage customers across all social platforms", 
          icon: "💬",
          color: "from-purple-700/30 to-indigo-700/20"
        },
        { 
          title: "E-commerce Sales", 
          description: "Convert visitors to buyers with emotional AI", 
          icon: "🛒",
          color: "from-indigo-700/30 to-blue-700/20"
        },
        { 
          title: "Lead Generation", 
          description: "Capture high-intent leads 24/7 automatically", 
          icon: "🎯",
          color: "from-blue-700/30 to-cyan-700/20"
        },
        { 
          title: "Emotional Conversion", 
          description: "70% conversion rate using psychology-based AI", 
          icon: "🧠",
          color: "from-cyan-700/30 to-teal-700/20"
        },
        { 
          title: "Automated Replies", 
          description: "Instant responses to DMs, comments & messages", 
          icon: "🤖",
          color: "from-teal-700/30 to-emerald-700/20"
        },
        { 
          title: "Capture Interested Customers", 
          description: "Identify & nurture warm leads effectively", 
          icon: "📥",
          color: "from-emerald-700/30 to-purple-700/20"
        }
      ].map((solution, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ 
            y: -15,
            boxShadow: "0 20px 40px rgba(91, 46, 255, 0.25)"
          }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 15
          }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-900/20 border border-gray-700 backdrop-blur-xl p-8 group"
        >
          {/* Glowing aura */}
          <div className={`absolute -inset-4 bg-gradient-to-br ${solution.color} rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500`}></div>
          
          {/* Glow border */}
          <div className={`absolute inset-0 border border-transparent group-hover:border-[#5B2EFF]/30 rounded-2xl transition-all duration-500`}></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Floating icon with glow */}
            <motion.div
              className="text-5xl mb-6 w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-gradient-to-br from-gray-800 to-black border border-gray-700 relative"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {solution.icon}
              <div className="absolute inset-0 rounded-full bg-[#5B2EFF] opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500"></div>
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-4 text-center">{solution.title}</h3>
            <p className="text-gray-300 text-center">{solution.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
  
  {/* Platform icons floating in background */}
  {/* Floating emojis aura */}
<div className="absolute inset-0 z-0 pointer-events-none opacity-10">
  {[
    '💬', '🛒', '📈', '🤖', '🧠', '🚀', '📥', '👥', '🪙', '🎯', '💡', '📦', '📱', '💻'
  ].map((icon, i) => (
    <motion.div
      key={i}
      className={`absolute ${
        i % 3 === 0 ? 'text-6xl' : i % 2 === 0 ? 'text-5xl' : 'text-4xl'
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 8, -8, 0],
      }}
      transition={{
        duration: Math.random() * 12 + 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {icon}
    </motion.div>
  ))}
</div>

   {/* Social media platform grid */}
  <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
    <div className="absolute inset-0 bg-[length:80px_80px] bg-[linear-gradient(to_right,rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.1)_1px,transparent_1px)]"></div>
  </div>

  {/* Floating emojis aura */}
<div className="absolute inset-0 z-0 pointer-events-none opacity-10">
  {[
    '💬', '🛒', '📈', '🤖', '🧠', '🚀', '📥', '👥', '🪙', '🎯',
    '💡', '📦', '📱', '💻', '📊', '📞', '📸', '🧲'
  ].map((icon, i) => (
    <motion.div
      key={i}
      className={`absolute ${
        i % 4 === 0 ? 'text-6xl' : i % 3 === 0 ? 'text-5xl' : 'text-4xl'
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: Math.random() * 14 + 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {icon}
    </motion.div>
  ))}
</div>

{/* Realistic meteors - bright dot with glowing trail */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {[...Array(8)].map((_, i) => {
    const colors = [
      ['#ffffff', '#00faff'],
      ['#ffffff', '#a855f7'],
      ['#ffffff', '#00ffb3'],
      ['#ffffff', '#ff38b2'],
      ['#ffffff', '#38bdf8'],
      ['#ffffff', '#4ade80'],
      ['#ffffff', '#f472b6'],
      ['#ffffff', '#e0f2fe']
    ]
    const [headColor, trailColor] = colors[i % colors.length]

    return (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 300}px`,
          rotate: `${Math.random() * 360}deg`,
        }}
        animate={{
          x: [0, 1200],
          y: [0, 900],
          opacity: [1, 0],
        }}
        transition={{
          delay: i * 1.3,
          duration: 5 + Math.random() * 3,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      >
        {/* Glowing tail */}
        <div
          className="w-[2px] h-56"
          style={{
            background: `linear-gradient(to top right, ${trailColor}, transparent)`,
            filter: 'blur(5px)',
            opacity: 0.9,
          }}
        />
        {/* Meteor head */}
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: headColor,
            boxShadow: `0 0 8px 4px ${headColor}`,
            marginTop: '-12px', // aligns head to front of trail
            marginLeft: '-1px'
          }}
        />
      </motion.div>
    )
  })}
</div>
</section>

              {/* Why We're Different Section */}

<section className="section-container py-32 relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
  <div className="content-wrapper max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
    <div className="image-container relative">
      <div className="glow-effect absolute -inset-12 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-3xl blur-3xl"></div>
      <div className="relative z-10 bg-gray-900 border border-gray-800 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden">
        <div className="floating w-64 h-64 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-full flex items-center justify-center">
          <span className="text-6xl">🤖</span>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]"></div>
      </div>
    </div>

    <div className="benefits-container">
      <h2 className="section-title text-4xl md:text-5xl font-bold mb-10">
        <span className="gradient-text bg-gradient-to-r from-[#a855f7] to-[#00faff]">Why We're Different</span>
      </h2>
      <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: "🧠", title: "Emotional Intelligence", description: "Detects subtle emotional cues to drive conversions" },
          { icon: "📈", title: "Sales Psychology", description: "Uses proven persuasion techniques in every response" },
          { icon: "⏱️", title: "24/7 Availability", description: "Never miss a sales opportunity, day or night" },
          { icon: "🔄", title: "Seamless Handoff", description: "Transitions warm leads to human agents automatically" }
        ].map((benefit, index) => (
          <div key={index} className="benefit-item bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 transition-all hover:border-purple-500/50">
            <div className="flex items-start gap-5">
              <div className="icon-container text-3xl bg-gradient-to-br from-purple-900/30 to-indigo-900/20 w-16 h-16 rounded-xl flex items-center justify-center">
                {benefit.icon}
              </div>
              <div>
                <h3 className="benefit-title text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="benefit-description text-gray-300">{benefit.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
                      {/*how it works section*/}
<section className="relative py-32 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e1a] to-[#1c1247]" />
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
  <div className="container mx-auto px-6 relative z-10">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-5xl font-bold mb-20 text-center"
    >
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 relative">
        How It Works
        <span className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent bg-[length:200%_100%] animate-shimmer" />
      </span>
    </motion.h2>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {[
        { 
          step: "01",
          icon: "💬", 
          title: "User Sends Message", 
          description: "Start a conversation with our AI chatbot through any platform",
          color: "from-purple-600/40 to-purple-800/20"
        },
        { 
          step: "02",
          icon: "🧠", 
          title: "AI Processing", 
          description: "Our advanced NLP understands context and intent in real-time",
          color: "from-indigo-600/40 to-indigo-800/20"
        },
        { 
          step: "03",
          icon: "🤖", 
          title: "Smart Response", 
          description: "Chatbot generates accurate, context-aware responses instantly",
          color: "from-blue-600/40 to-blue-800/20"
        },
        { 
          step: "04",
          icon: "🚀", 
          title: "Action & Integration", 
          description: "Seamlessly integrates with your systems to complete tasks",
          color: "from-teal-600/40 to-teal-800/20"
        }
      ].map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ 
            y: -15,
            boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)"
          }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 15
          }}
          className="relative rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-700 backdrop-blur-xl p-8"
        >
          {/* Gradient border glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl opacity-30 z-0`}></div>
          <div className="absolute inset-0 border border-white/10 rounded-2xl z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Step indicator */}
            <div className="absolute top-4 right-4 bg-gray-800/50 text-gray-300 text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
              {step.step}
            </div>
            
            {/* Floating icon */}
            <motion.div
              className="text-5xl mb-6 w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 floating"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {step.icon}
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-4 text-center">{step.title}</h3>
            <p className="text-gray-300 text-center">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
 {/* Realistic meteors - bright dot with glowing trail */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {[...Array(8)].map((_, i) => {
    const colors = [
      ['#ffffff', '#00faff'],
      ['#ffffff', '#a855f7'],
      ['#ffffff', '#00ffb3'],
      ['#ffffff', '#ff38b2'],
      ['#ffffff', '#38bdf8'],
      ['#ffffff', '#4ade80'],
      ['#ffffff', '#f472b6'],
      ['#ffffff', '#e0f2fe']
    ]
    const [headColor, trailColor] = colors[i % colors.length]

    return (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 300}px`,
          rotate: `${Math.random() * 360}deg`,
        }}
        animate={{
          x: [0, 1200],
          y: [0, 900],
          opacity: [1, 0],
        }}
        transition={{
          delay: i * 1.3,
          duration: 5 + Math.random() * 3,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      >
        {/* Glowing tail */}
        <div
          className="w-[2px] h-56"
          style={{
            background: `linear-gradient(to top right, ${trailColor}, transparent)`,
            filter: 'blur(5px)',
            opacity: 0.9,
          }}
        />
        {/* Meteor head */}
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: headColor,
            boxShadow: `0 0 8px 4px ${headColor}`,
            marginTop: '-12px', // aligns head to front of trail
            marginLeft: '-1px'
          }}
        />
      </motion.div>
    )
  })}
</div>

{/* Corner spotlights / aura beams */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {/* Top-left beam */}
  <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.35),_transparent_70%)] blur-3xl" />
  
  {/* Bottom-right beam */}
  <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.35),_transparent_70%)] blur-3xl" />
  
  {/* Top-right accent burst */}
  <div className="absolute -top-32 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,_rgba(236,72,153,0.25),_transparent_70%)] blur-2xl" />
  
  {/* Center beam glow */}
  <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_70%)] blur-[120px]" />
</div>


</section>



{/* AI System Pipeline Section */}
<section className="section-container py-32 relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
  <div className="content-wrapper max-w-7xl mx-auto px-6 relative z-10">
    <h2 className="section-title text-4xl md:text-5xl font-bold mb-20 text-center">
      <span className="gradient-text bg-gradient-to-r from-[#a855f7] to-[#06b6d4]">Our AI Sales Pipeline</span>
    </h2>

    <div className="pipeline-container relative">
      <div className="timeline-line absolute top-1/2 left-0 right-0 h-1 bg-gray-800 transform -translate-y-1/2 z-0"></div>
      <div className="steps-container flex flex-col md:flex-row justify-between relative z-10 gap-10 md:gap-0">
        {[
          { icon: "👋", title: "First Contact", description: "Engages prospect with personalized opener" },
          { icon: "❓", title: "Needs Analysis", description: "Identifies pain points & desires" },
          { icon: "💡", title: "Solution Matching", description: "Recommends perfect product fit" },
          { icon: "💰", title: "Objection Handling", description: "Overcomes concerns instantly" },
          { icon: "✅", title: "Close & Handoff", description: "Secures sale & transfers to human" }
        ].map((step, index) => (
          <div key={index} className="step-item bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full md:w-56 text-center relative hover:border-cyan-500 transition-colors">
            <div className="step-icon-container mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-900/30 to-indigo-900/20 flex items-center justify-center text-3xl mb-4">
              {step.icon}
            </div>
            <h3 className="step-title text-xl font-bold mb-2">{step.title}</h3>
            <p className="step-description text-gray-300 text-sm">{step.description}</p>
            {index < 4 && (
              <div className="hidden md:block connector-line absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-cyan-500"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
  {/* Corner spotlights / aura beams */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {/* Top-left beam */}
  <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.35),_transparent_70%)] blur-3xl" />
  
  {/* Bottom-right beam */}
  <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.35),_transparent_70%)] blur-3xl" />
  
  {/* Top-right accent burst */}
  <div className="absolute -top-32 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,_rgba(236,72,153,0.25),_transparent_70%)] blur-2xl" />
  
  {/* Center beam glow */}
  <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_70%)] blur-[120px]" />
</div>
</section>

{/* Simulated Sales Chat Section */}
<section className="section-container py-32 relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
  <div className="content-wrapper max-w-4xl mx-auto px-6 relative z-10">
    <h2 className="section-title text-4xl md:text-5xl font-bold mb-20 text-center">
      <span className="gradient-text bg-gradient-to-r from-[#a855f7] to-[#00faff]">
        AI-Powered Sales Conversion
      </span>
    </h2>

    <div className="chat-container bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-3xl overflow-hidden">
      {/* Chat Header */}
      <div className="chat-header bg-gray-900 border-b border-gray-800 p-5 flex items-center">
        <div className="avatar w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center">
          <span>🤖</span>
        </div>
        <div className="ml-4">
          <h3 className="font-bold">Sales Assistant</h3>
          <p className="text-xs text-gray-400">Online • Ready to help</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages p-6 space-y-6">
        <div className="message user-message ml-auto max-w-md">
          <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/20 rounded-2xl rounded-tr-none p-5">
            <p>I’m just browsing. Not looking to buy anything right now.</p>
          </div>
          <div className="text-right text-xs text-gray-500 mt-2">You • Just now</div>
        </div>

        <div className="message ai-response max-w-md">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900/80 rounded-2xl rounded-tl-none p-5">
            <p className="mb-2">Totally fair 😊 But just curious — what caught your eye? I might show you something useful without pressure.</p>
          </div>
          <div className="text-xs text-gray-500 mt-2">Sales Assistant • Now</div>
        </div>

        <div className="message user-message ml-auto max-w-md">
          <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/20 rounded-2xl rounded-tr-none p-5">
            <p>That smart lamp looks cool. But I already have a light.</p>
          </div>
          <div className="text-right text-xs text-gray-500 mt-2">You • Now</div>
        </div>

        <div className="message ai-response max-w-md">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900/80 rounded-2xl rounded-tl-none p-5">
            <p>It’s more than a light 💡 — it adapts to your mood, improves sleep with circadian rhythm tech, and even boosts focus during work.</p>
            <p className="mt-2">People say it’s like having peace of mind in a lamp. Want to try it risk-free for 7 days?</p>
          </div>
          <div className="text-xs text-gray-500 mt-2">Sales Assistant • Now</div>
        </div>

        <div className="message user-message ml-auto max-w-md">
          <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/20 rounded-2xl rounded-tr-none p-5">
            <p>Wait, it helps with focus and sleep? That’s actually interesting...</p>
          </div>
          <div className="text-right text-xs text-gray-500 mt-2">You • Now</div>
        </div>

        <div className="message ai-response max-w-md">
          <div className="bg-gradient-to-r from-emerald-800/30 to-emerald-900/20 rounded-2xl rounded-tl-none p-5">
            <p>Absolutely! It adjusts light temperature based on time of day. Users report feeling 23% more energized in the first week. 🔥</p>
            <p className="mt-2">I can reserve your discount & free return option right now. Should I?</p>
          </div>
          <div className="text-xs text-gray-500 mt-2">Sales Assistant • Now</div>
        </div>

        <div className="message user-message ml-auto max-w-md">
          <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/20 rounded-2xl rounded-tr-none p-5">
            <p>Alright. Let’s do it. Send me the link its too intresting product i like it for my better sleep 👀</p>
          </div>
          <div className="text-right text-xs text-gray-500 mt-2">You • Now</div>
        </div>

        <div className="message ai-response max-w-md">
          <div className="bg-gradient-to-r from-cyan-700/30 to-cyan-900/20 rounded-2xl rounded-tl-none p-5">
            <p>Love it! 🎉 Here's your link:</p>
            <p className="mt-2"><a href="#" className="text-cyan-400 underline">Complete Purchase</a></p>
            <p className="mt-4">You're going to love the glow ✨.Should i send you seller contact number ?
            
            </p>
          </div>
          <div className="text-xs text-gray-500 mt-2">Sales Assistant • Now</div>
        </div>
      </div>

      {/* Typing Indicator */}
      <div className="typing-indicator px-6 pb-6">
        <div className="bg-gray-800 rounded-full px-5 py-3 max-w-max">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      
      {/* Footer */}
      <Footer />
    </div>
  )
}