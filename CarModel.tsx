import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

const CarModel: React.FC = () => {
  const { scene } = useGLTF('/src/assets/toyota_supra.glb');
  scene.traverse((child: any) => {
    if (child.isMesh) {
      // Set material properties for a reflective look
      child.material = new MeshStandardMaterial({
        color: 0xffffff, // You can adjust this to match the desired color.
        metalness: 0.9, // High metalness for a shiny metallic look.
        roughness: 0.3, // Low roughness for a smooth surface.
      });
    }
  });
  return <primitive object={scene} scale={1.75} position={[0, -0.7, 0]} />;
};

const CarCanvas: React.FC = () => {
  return (
    <div className="car-container">
      <Canvas
        style={{ width: '100%', height: '300px' }}
        camera={{ position: [0, 1, 5], fov: 40 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} />
        <CarModel />
        <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default CarCanvas;