import { useEffect, useRef } from "react";

export default function DottedBackground({ children, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const dotSpacing = 20;
    const dotRadius = 2;
    const fadeFactor = 0.1;
    const brightnessRadius = 130;

    const dots = [];

    for (let x = 0; x < width; x += dotSpacing) {
      for (let y = 0; y < height; y += dotSpacing) {
        dots.push({ x, y });
      }
    }

    let mouse = { x: -9999, y: -9999 };

    const handleMouseMove = (e) => {
      mouse = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const { x, y } = dots[i];

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const brightness = Math.max(1 - dist / brightnessRadius, fadeFactor);

        ctx.globalAlpha = brightness;
        ctx.fillStyle = "#95ff00";
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, 1.5 * Math.PI);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Regenerate dots for new dimensions
      dots.length = 0;
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          dots.push({ x, y });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={`relative w-screen -mx-[calc((100vw-100%)/2)] ${className}`}>
      {/* Canvas background layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%", marginTop: "100px" }}
      />
      
      {/* Content layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
