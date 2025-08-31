import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SplineScene() {
  const mountRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let renderer, scene, camera, cube, animationId;

    try {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      mountRef.current.appendChild(renderer.domElement);

      // Cube setup
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color: 0x00d8ff });
      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // Lighting
      const light = new THREE.PointLight(0xffffff, 1, 100);
      light.position.set(10, 10, 10);
      scene.add(light);

      // Animate
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const handleResize = () => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        mountRef.current?.removeChild(renderer.domElement);
        renderer.dispose();
      };
    } catch (err) {
      console.error('3D Scene Error:', err);
      setError(true);
    }
  }, []);

  if (error) {
    return <div className="text-red-500">3D Scene failed to load.</div>;
  }

  return <div className="w-full h-screen bg-transparent" ref={mountRef}></div>;
}
