import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SRGBColorSpace } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'


export default function WebGLBackground() {
  const mountRef = useRef(null)
  
  // Purple aura color palette
  const colors = [
    new THREE.Color(0x8a2be2), // Purple
    new THREE.Color(0x9400d3), // Dark violet
    new THREE.Color(0x9932cc), // Dark orchid
    new THREE.Color(0xba55d3), // Medium orchid
    new THREE.Color(0x9370db), // Medium purple
    new THREE.Color(0x7b68ee)  // Medium slate blue
  ]

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = SRGBColorSpace
    mountRef.current.appendChild(renderer.domElement)

    // Post-processing setup
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)
    
    // Bloom effect for the aura
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    )
    composer.addPass(bloomPass)
    
    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    // Create a massive particle system
    const particlesCount = 20000
    const positions = new Float32Array(particlesCount * 3)
    const colorsArray = new Float32Array(particlesCount * 3)
    const sizes = new Float32Array(particlesCount)
    const velocities = new Float32Array(particlesCount * 3)
    
    for (let i = 0; i < particlesCount; i++) {
      // Position particles in a sphere
      const radius = 20 + Math.random() * 30
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      const idx = i * 3
      positions[idx] = radius * Math.sin(phi) * Math.cos(theta)
      positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[idx + 2] = radius * Math.cos(phi)
      
      // Velocity - random direction with slight inward bias
      velocities[idx] = (Math.random() - 0.5) * 0.2
      velocities[idx + 1] = (Math.random() - 0.5) * 0.2
      velocities[idx + 2] = (Math.random() - 0.5) * 0.2 - 0.1 // inward bias
      
      // Color - purple aura gradient
      const colorIdx = Math.floor(Math.random() * colors.length)
      const color = colors[colorIdx]
      colorsArray[idx] = color.r
      colorsArray[idx + 1] = color.g
      colorsArray[idx + 2] = color.b
      
      // Size
      sizes[i] = 0.5 + Math.random() * 1.5
    }
    
    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
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
    })
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
    
    // Create a dark energy vortex at the center
    const vortexGeometry = new THREE.TorusGeometry(5, 1.5, 32, 100)
    const vortexMaterial = new THREE.MeshBasicMaterial({
      color: 0x4b0082, // Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })
    const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial)
    scene.add(vortex)
    
    // Add subtle lighting
    const ambientLight = new THREE.AmbientLight(0x663399, 0.3)
    scene.add(ambientLight)
    
    const pointLight = new THREE.PointLight(0x9370db, 1.5, 100)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)
    
    camera.position.z = 40
    
    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      requestAnimationFrame(animate)
      
      const elapsedTime = clock.getElapsedTime()
      particlesMaterial.uniforms.time.value = elapsedTime
      
      // Update particles
      const positions = particlesGeometry.attributes.position.array
      const velocitiesArr = velocities
      
      for (let i = 0; i < positions.length; i += 3) {
        // Move particles
        positions[i] += velocitiesArr[i] * 0.2
        positions[i + 1] += velocitiesArr[i + 1] * 0.2
        positions[i + 2] += velocitiesArr[i + 2] * 0.2
        
        // Attract particles to the center
        const dx = -positions[i]
        const dy = -positions[i + 1]
        const dz = -positions[i + 2]
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
        
        // Apply stronger attraction when farther away
        const attraction = Math.min(0.0005 * distance * distance, 0.05)
        positions[i] += dx * attraction
        positions[i + 1] += dy * attraction
        positions[i + 2] += dz * attraction
        
        // If particle is too close to center, reset it to outer sphere
        if (distance < 5) {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const radius = 40 + Math.random() * 10
          
          positions[i] = radius * Math.sin(phi) * Math.cos(theta)
          positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
          positions[i + 2] = radius * Math.cos(phi)
        }
      }
      
      particlesGeometry.attributes.position.needsUpdate = true
      
      // Animate vortex
      vortex.rotation.x = elapsedTime * 0.2
      vortex.rotation.y = elapsedTime * 0.3
      vortex.scale.set(1 + Math.sin(elapsedTime) * 0.1, 1 + Math.cos(elapsedTime) * 0.1, 1)
      
      // Animate light intensity
      particlesMaterial.uniforms.intensity.value = 1.2 + Math.sin(elapsedTime) * 0.3
      
      // Render with post-processing
      composer.render()
    }
    
    animate()
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      mountRef.current.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])
  
  return <div ref={mountRef} className="fixed top-0 left-0 -z-10 w-full h-full opacity-40 pointer-events-none" />
}
