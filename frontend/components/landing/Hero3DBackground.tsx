"use client";

import React, { useEffect, useRef } from "react";

interface JobBadge3D {
  label: string;
  subLabel?: string;
  type: "role" | "ctc" | "skill" | "company" | "match";
  gx: number;
  gy: number;
}

export function Hero3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse fluid physics
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Grid Dimensions for Liquid 3D Mesh
    const cols = 28;
    const rows = 16;
    const gridSpacingX = width / (cols - 1);
    const gridSpacingY = height / (rows - 1);

    // STRICTLY PERIMETER / MARGIN POSITIONING
    // Center area (gx 5 to 22, gy 2 to 13) is reserved clean space for Title, Subtitle, and Search Box.
    const jobItems: JobBadge3D[] = [
      // Left Margin Items
      { label: "Senior Full-Stack", subLabel: "React 19 & Next.js", type: "role", gx: 2, gy: 3 },
      { label: "₹36,00,000 / yr", subLabel: "Verified CTC Benchmark", type: "ctc", gx: 3, gy: 7 },
      { label: "Staff Cloud Lead", subLabel: "K8s & Go Microservices", type: "role", gx: 2, gy: 11 },
      { label: "Techcy Routes", subLabel: "Official Sponsor", type: "company", gx: 3, gy: 14 },

      // Right Margin Items
      { label: "WhiteTrack Technologies", subLabel: "Official Sponsor", type: "company", gx: 24, gy: 3 },
      { label: "AI & LLM Architect", subLabel: "Python & RAG Systems", type: "role", gx: 25, gy: 7 },
      { label: "98% Match Score", subLabel: "Criteria Overlap", type: "match", gx: 24, gy: 11 },
      { label: "WhiteAurax", subLabel: "Official Sponsor", type: "company", gx: 25, gy: 14 },
    ];

    let time = 0;

    const render = () => {
      time += 0.02;

      // Mouse inertia interpolation
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Compute 3D Mesh Grid Vertices with Liquid Waves
      const gridVertices: { x: number; y: number; z: number; projX: number; projY: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        gridVertices[r] = [];
        for (let c = 0; c < cols; c++) {
          const baseX = c * gridSpacingX;
          const baseY = r * gridSpacingY;

          // Subtle liquid 3D wave displacement
          const waveZ =
            Math.sin(time + c * 0.3 + r * 0.2) * 14 +
            Math.cos(time * 0.7 + c * 0.15 - r * 0.25) * 10;

          // Mouse ripple effect
          const dx = baseX - mouseX;
          const dy = baseY - mouseY;
          const mouseDist = Math.sqrt(dx * dx + dy * dy);
          const mouseEffect = Math.max(0, (200 - mouseDist) / 200);
          const rippleZ = Math.sin(mouseDist * 0.06 - time * 3) * 18 * mouseEffect;

          const totalZ = waveZ + rippleZ;

          // 3D Perspective Projection
          const perspectiveScale = 1 + totalZ * 0.0015;
          const projX = (baseX - width / 2) * perspectiveScale + width / 2 + (mouseX - width / 2) * 0.015;
          const projY = (baseY - height / 2) * perspectiveScale + height / 2 + (mouseY - height / 2) * 0.015;

          gridVertices[r][c] = {
            x: baseX,
            y: baseY,
            z: totalZ,
            projX,
            projY,
          };
        }
      }

      // 1. Draw Clean Light 3D Mesh Grid Lines
      ctx.lineWidth = 0.8;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = gridVertices[r][c];

          // Horizontal lines
          if (c < cols - 1) {
            const vNext = gridVertices[r][c + 1];
            ctx.beginPath();
            ctx.moveTo(v.projX, v.projY);
            ctx.lineTo(vNext.projX, vNext.projY);
            ctx.strokeStyle = "#2563EB";
            ctx.globalAlpha = Math.min(0.18, Math.max(0.03, 0.07 + (v.z + vNext.z) * 0.002));
            ctx.stroke();
          }

          // Vertical lines
          if (r < rows - 1) {
            const vDown = gridVertices[r + 1][c];
            ctx.beginPath();
            ctx.moveTo(v.projX, v.projY);
            ctx.lineTo(vDown.projX, vDown.projY);
            ctx.strokeStyle = "#0284C7";
            ctx.globalAlpha = Math.min(0.18, Math.max(0.03, 0.07 + (v.z + vDown.z) * 0.002));
            ctx.stroke();
          }

          // Glowing grid intersection points
          if ((r + c) % 3 === 0) {
            ctx.beginPath();
            ctx.arc(v.projX, v.projY, 1.3, 0, Math.PI * 2);
            ctx.fillStyle = "#2563EB";
            ctx.globalAlpha = Math.min(0.35, Math.max(0.05, 0.14 + v.z * 0.005));
            ctx.fill();
          }
        }
      }

      // 2. Render 3D Margin Glassmorphism Floating Cards
      ctx.globalAlpha = 1;

      for (let i = 0; i < jobItems.length; i++) {
        const item = jobItems[i];
        if (!item) continue;

        const r = Math.min(rows - 1, Math.max(0, item.gy));
        const c = Math.min(cols - 1, Math.max(0, item.gx));
        const v = gridVertices[r]?.[c];
        if (!v) continue;

        ctx.font = `700 11px sans-serif`;
        const textWidth = ctx.measureText(item.label).width;
        const paddingX = 12;
        const boxWidth = textWidth + paddingX * 2 + 12;
        const boxHeight = item.subLabel ? 34 : 22;

        const rectX = v.projX - boxWidth / 2;
        const rectY = v.projY - boxHeight / 2;

        // Ambient soft shadow glow behind pill
        ctx.save();
        ctx.shadowColor = "rgba(37, 99, 235, 0.15)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Card Pill Background (Ultra Light Glassmorphism)
        ctx.beginPath();
        const radius = boxHeight / 2;
        ctx.roundRect(rectX, rectY, boxWidth, boxHeight, radius);

        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.strokeStyle = item.type === "ctc" ? "rgba(2, 132, 199, 0.4)" : item.type === "company" ? "rgba(124, 58, 237, 0.35)" : "rgba(37, 99, 235, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Indicator Dot
        ctx.beginPath();
        ctx.arc(rectX + paddingX + 2, v.projY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = item.type === "ctc" ? "#0284C7" : item.type === "company" ? "#7C3AED" : "#2563EB";
        ctx.fill();

        // Title Label
        ctx.fillStyle = "#0F172A";
        ctx.fillText(item.label, rectX + paddingX + 12, rectY + (item.subLabel ? 14 : 15));

        // Subtitle Label
        if (item.subLabel) {
          ctx.font = `600 8.5px sans-serif`;
          ctx.fillStyle = "#475569";
          ctx.fillText(item.subLabel, rectX + paddingX + 12, rectY + 26);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full opacity-90"
    />
  );
}
