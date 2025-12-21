"use client";

import { useState, useEffect, useRef } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function ShaderBackground() {
  const [isReady, setIsReady] = useState(false);
  const frameCountRef = useRef(0);

  useEffect(() => {
    // Wait for several animation frames to allow shader compilation and GPU warmup
    let rafId: number;
    const waitForFrames = () => {
      frameCountRef.current++;
      // Wait ~30 frames (~500ms at 60fps) for GPU to stabilize
      if (frameCountRef.current < 30) {
        rafId = requestAnimationFrame(waitForFrames);
      } else {
        setIsReady(true);
      }
    };

    rafId = requestAnimationFrame(waitForFrames);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="fixed inset-0 -z-10" style={{ willChange: "transform" }}>
      {/* Static background color while shader loads */}
      <div
        className="absolute inset-0 bg-[#1a1a2e] transition-opacity duration-300"
        style={{
          opacity: isReady ? 0 : 1,
          pointerEvents: "none",
          willChange: "opacity",
        }}
      />
      {/* Shader canvas with fade-in */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: isReady ? 1 : 0, willChange: "opacity" }}
      >
        <ShaderGradientCanvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <ShaderGradient
            type="waterPlane"
            animate="on"
            uTime={0}
            uSpeed={0.1}
            uStrength={1.5}
            uDensity={1.5}
            uFrequency={5.5}
            uAmplitude={3}
            positionX={0}
            positionY={0}
            positionZ={0}
            rotationX={0}
            rotationY={0}
            rotationZ={235}
            color1="#606080"
            color2="#8d7dca"
            color3="#212121"
            reflection={0.1}
            wireframe={false}
            shader="defaults"
            cAzimuthAngle={180}
            cPolarAngle={80}
            cDistance={2.8}
            cameraZoom={1}
            lightType="3d"
            brightness={1}
            envPreset="city"
            grain="on"
            grainBlending={0.5}
          />
        </ShaderGradientCanvas>
      </div>
    </div>
  );
}
