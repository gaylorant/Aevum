"use client";

import { useEffect, useRef, useState } from "react";

const BLOBS = [
  {
    id: "blob-blue",
    homeOffset: [-90, -80] as [number, number],
    cornerRatio: [0.08, 0.08] as [number, number],
    noisePhase: 0,
    gradient: "radial-gradient(circle, rgba(30,144,255,0.65) 0%, rgba(0,40,255,0.2) 45%, transparent 75%)",
    blur: "95px",
    size: 500,
    sizeMobile: 320,
  },
  {
    id: "blob-purple",
    homeOffset: [85, -75] as [number, number],
    cornerRatio: [0.88, 0.08] as [number, number],
    noisePhase: 1.5,
    gradient: "radial-gradient(circle, rgba(168,85,247,0.65) 0%, rgba(109,40,217,0.2) 45%, transparent 75%)",
    blur: "90px",
    size: 480,
    sizeMobile: 300,
  },
  {
    id: "blob-cyan",
    homeOffset: [-80, 82] as [number, number],
    cornerRatio: [0.08, 0.88] as [number, number],
    noisePhase: 3.1,
    gradient: "radial-gradient(circle, rgba(6,182,212,0.65) 0%, rgba(0,168,204,0.2) 45%, transparent 75%)",
    blur: "92px",
    size: 510,
    sizeMobile: 310,
  },
  {
    id: "blob-teal",
    homeOffset: [82, 78] as [number, number],
    cornerRatio: [0.86, 0.86] as [number, number],
    noisePhase: 4.8,
    gradient: "radial-gradient(circle, rgba(20,184,166,0.65) 0%, rgba(13,148,136,0.2) 45%, transparent 75%)",
    blur: "100px",
    size: 490,
    sizeMobile: 300,
  },
];

export default function InteractiveBlobs() {
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const isTouchRef = useRef(false);
  const rafRef = useRef<number>(0);
  const stateRef = useRef(
    BLOBS.map(b => ({ ...b, cx: 0, cy: 0 }))
  );
  const elRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const update = () => {
      setDims({ w: window.innerWidth, h: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!dims.w) return;

    stateRef.current.forEach(b => {
      b.cx = dims.w / 2 + b.homeOffset[0];
      b.cy = dims.h / 2 + b.homeOffset[1];
    });

    const onMouseMove = (e: MouseEvent) => {
      isTouchRef.current = false;
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
    };
    const onTouchStart = () => {
      isTouchRef.current = true;
      mouseRef.current = { x: -9999, y: -9999, active: false };
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    const animate = () => {
      const cx = dims.w / 2;
      const cy = dims.h / 2;
      const mouse = mouseRef.current;
      const time = Date.now() * 0.0005;

      let scatter = false;
      if (!isTouchRef.current && mouse.active) {
        const dx = mouse.x - cx;
        const dy = mouse.y - cy;
        if (Math.sqrt(dx * dx + dy * dy) < 320) scatter = true;
      }

      stateRef.current.forEach(b => {
        const blobSize = dims.w < 768 ? b.sizeMobile : b.size;

        const targetX = scatter
          ? b.cornerRatio[0] * dims.w
          : cx + b.homeOffset[0];
        const targetY = scatter
          ? b.cornerRatio[1] * dims.h
          : cy + b.homeOffset[1];

        b.cx += (targetX - b.cx) * 0.038;
        b.cy += (targetY - b.cy) * 0.038;

        const waveX = Math.sin(time + b.noisePhase) * 22;
        const waveY = Math.cos(time * 0.85 + b.noisePhase + 1) * 20;

        const el = elRefs.current[b.id];
        if (el) {
          el.style.width = `${blobSize}px`;
          el.style.height = `${blobSize}px`;
          el.style.transform = `translate3d(${b.cx + waveX - blobSize / 2}px, ${b.cy + waveY - blobSize / 2}px, 0)`;
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [dims]);

  return (
    <div
      className="fixed inset-0 z-[1] overflow-hidden pointer-events-none select-none"
      style={{ isolation: "isolate" }}
    >
      {BLOBS.map(b => (
        <div
          key={b.id}
          ref={el => { elRefs.current[b.id] = el; }}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            background: b.gradient,
            filter: `blur(${b.blur})`,
            willChange: "transform",
            // mix-blend-screen ONLY on desktop — on mobile it causes the white panel
            mixBlendMode: isMobile ? "normal" : "screen",
            transform: `translate3d(${dims.w / 2 + b.homeOffset[0] - b.size / 2}px, ${dims.h / 2 + b.homeOffset[1] - b.size / 2}px, 0)`,
          }}
        />
      ))}
    </div>
  );
}