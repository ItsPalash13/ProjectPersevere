import { useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import { useControls, folder } from 'leva';
import * as THREE from 'three';

function Scene() {
  const camera = useThree((state) => state.camera);

  const { position, zoom, fov } = useControls({
    Camera: folder({
      position: {
        value: { x: 0, y: 0, z: 5 },
        step: 0.01,
        onChange: (v) => {
          camera.position.set(v.x, v.y, v.z);
          camera.updateProjectionMatrix();
        }
      },
      zoom: {
        value: 20,
        min: 10,
        max: 100,
        step: 1,
        onChange: (v) => {
          camera.zoom = v;
          camera.updateProjectionMatrix();
        }
      },
      fov: {
        value: 50,
        min: 10,
        max: 120,
        step: 1,
        onChange: (v) => {
          camera.fov = v;
          camera.updateProjectionMatrix();
        }
      }
    })
  });

  return (
    <>
      <MapControls
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minZoom={20}
        maxZoom={80}
        zoomSpeed={0.5}
        panSpeed={1}
        screenSpacePanning={true}
      />
      
      {/* Water */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color={0x1E90FF} transparent opacity={0.8} />
      </mesh>

      {/* Black dot */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={"#000000"} transparent opacity={0.8} />
      </mesh>

      {/* Circle */}
      <mesh position={[0.1, 0, 2]}>
        <circleGeometry args={[2, 50, 0, 9]} />
        <meshBasicMaterial color={"#ff0000"} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

export default function IslandsScene() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-lg font-bold mb-4 text-center">
        Map View
      </div>
      <div 
        style={{ 
          width: '100%', 
          height: '60vh', 
          minHeight: '400px',
          cursor: 'grab'
        }} 
        className="border-2 border-gray-300 rounded-lg"
        onMouseDown={(e) => {
          e.currentTarget.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
      >
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 5],

            near: 0.6,
            far: 100
          }}
        >
          <Scene />
        </Canvas>
      </div>
      <div className="mt-4 text-sm text-gray-600 text-center">
        Use mouse wheel to zoom in and out
      </div>
    </div>
  );
}