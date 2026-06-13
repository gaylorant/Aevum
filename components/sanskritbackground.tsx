"use client";

import { useEffect, useRef } from "react";
import { samevaWords } from "@/lib/Sanskritwords";

const PARTICLE_WORDS = [
  { w: 'शान्ति',   p: 'Shānti',     m: 'Inner Peace' },
  { w: 'करुणा',   p: 'Karuṇā',     m: 'Compassion' },
  { w: 'श्रवण',   p: 'Shravana',   m: 'Deep Listening' },
  { w: 'विश्वास',  p: 'Vishwās',    m: 'Trust' },
  { w: 'स्वयं',   p: 'Svayam',     m: 'The Self' },
  { w: 'ध्यान',   p: 'Dhyāna',     m: 'Reflection' },
  { w: 'मुक्ति',  p: 'Mukti',      m: 'Freedom' },
  { w: 'प्रेम',   p: 'Prema',      m: 'Love' },
  { w: 'संतोष',   p: 'Saṁtoṣa',    m: 'Contentment' },
  { w: 'विवेक',   p: 'Viveka',     m: 'Discernment' },
  { w: 'क्षमा',   p: 'Kṣamā',      m: 'Forgiveness' },
  { w: 'सत्य',    p: 'Satya',      m: 'Truthfulness' },
  { w: 'साहस',    p: 'Sāhas',      m: 'Courage' },
  { w: 'आनन्द',   p: 'Ānanda',     m: 'Joy' },
  { w: 'मैत्री',  p: 'Maitrī',     m: 'Kindness' },
  { w: 'अभय',    p: 'Abhaya',     m: 'Fearlessness' },
  { w: 'चेतना',  p: 'Chetanā',    m: 'Awareness' },
  { w: 'समभाव',  p: 'Samabhāva',  m: 'Equanimity' },
  { w: 'आरोग्य',  p: 'Ārogya',     m: 'Wellbeing' },
  { w: 'विसर्ग',  p: 'Visarga',    m: 'Letting Go' },
];

const COLORS = [
  'rgba(184,195,255,0.9)',
  'rgba(160,255,238,0.9)',
  'rgba(230,180,230,0.9)',
  'rgba(173,216,230,0.9)',
  'rgba(145,215,250,0.9)',
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  wanderAngle: number;
  wanderSpeed: number;
  wanderStrength: number;
  word: string; phonetic: string; meaning: string;
  size: number;
  baseOpacity: number;
  opacity: number;
  color: string;
  hovered: boolean;
}

export default function sanskritbackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const initParticles = (width: number, height: number) => {
    const MAX = 20;
    const particles: Particle[] = [];
    const cols = Math.ceil(Math.sqrt(MAX * (width / height)));
    const rows = Math.ceil(MAX / cols);
    const cellW = width / cols;
    const cellH = height / rows;

    const cells: [number, number][] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push([r, c]);
    cells.sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(cells.length, MAX); i++) {
      const [r, c] = cells[i];
      const px = 0.2 * cellW + c * cellW + Math.random() * cellW * 0.6;
      const py = 0.2 * cellH + r * cellH + Math.random() * cellH * 0.6;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.06 + Math.random() * 0.1;
      const wordObj = PARTICLE_WORDS[i % PARTICLE_WORDS.length];

      particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: 0.002 + Math.random() * 0.003,
        wanderStrength: 0.006 + Math.random() * 0.008,
        word: wordObj.w,
        phonetic: wordObj.p,
        meaning: wordObj.m,
        size: 13 + Math.random() * 5,
        baseOpacity: 0.18 + Math.random() * 0.16,
        opacity: 0.18 + Math.random() * 0.16,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        hovered: false,
      });
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const tooltipEl = tooltipRef.current;
    if (!canvas || !tooltipEl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      let hoveredP: Particle | null = null;

      particlesRef.current.forEach(p => {
        p.wanderAngle += p.wanderSpeed;
        p.vx += Math.cos(p.wanderAngle) * p.wanderStrength;
        p.vy += Math.sin(p.wanderAngle) * p.wanderStrength;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 0.18) { p.vx = (p.vx / spd) * 0.18; p.vy = (p.vy / spd) * 0.18; }
        p.x += p.vx; p.y += p.vy;

        const margin = 80;
        if (p.x < -margin) p.x = canvas.width + margin;
        if (p.x > canvas.width + margin) p.x = -margin;
        if (p.y < -margin) p.y = canvas.height + margin;
        if (p.y > canvas.height + margin) p.y = -margin;

        // Hover detection
        ctx.font = `${p.size}px 'Noto Sans Devanagari', serif`;
        const tw = ctx.measureText(p.word).width;
        const isHovered =
          mouse.x >= p.x - tw / 2 - 6 && mouse.x <= p.x + tw / 2 + 6 &&
          mouse.y >= p.y - p.size - 4 && mouse.y <= p.y + 8;

        p.hovered = isHovered;
        if (isHovered) hoveredP = p;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (isHovered) {
          p.opacity = 0.95;
        } else if (dist < 80) {
          p.opacity = Math.min(p.baseOpacity + (1 - dist / 80) * 0.25, 0.48);
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.04;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.textAlign = 'center';
        if (p.hovered) {
          ctx.shadowColor = '#a0ffee';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#a0ffee';
          ctx.font = `${p.size + 1}px 'Noto Sans Devanagari', serif`;
        } else {
          ctx.shadowColor = 'rgba(184,195,255,0.35)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = p.color;
        }
        ctx.fillText(p.word, p.x, p.y);
        ctx.restore();
      });

      // Tooltip
      if (hoveredP) {
        const hp = hoveredP as Particle;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = hp.x + 'px';
        tooltipEl.style.top = (hp.y - hp.size - 8) + 'px';
        tooltipEl.innerHTML = `
          <div style="font-size:12px;font-weight:700;color:#a0ffee;letter-spacing:0.06em;margin-bottom:3px;">${hp.phonetic}</div>
          <div style="font-family:'Noto Sans Devanagari',serif;font-size:15px;color:#e2e1ef;margin-bottom:3px;">${hp.word}</div>
          <div style="font-size:11px;color:rgba(196,197,217,0.7);">&ldquo;${hp.meaning}&rdquo;</div>
        `;
      } else {
        tooltipEl.style.display = 'none';
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div
        ref={tooltipRef}
        style={{
          display: 'none',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 999,
          background: 'rgba(9,8,30,0.92)',
          border: '1px solid rgba(0,206,209,0.3)',
          borderRadius: '14px',
          padding: '10px 16px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 20px rgba(0,206,209,0.12)',
          transform: 'translate(-50%, -100%)',
          textAlign: 'center',
          minWidth: '120px',
          fontFamily: 'Inter, sans-serif',
        }}
      />
    </>
  );
}