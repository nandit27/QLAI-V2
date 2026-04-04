import React, { useState, useRef, useEffect } from 'react';

const TextHoverEffect = ({ text = "QUICKLEARN" + "AI", className = "" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const svgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
        });
      }
    };

    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('mousemove', handleMouseMove);
      return () => {
        svgElement.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 300"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none cursor-pointer w-full"
        style={{ minHeight: '300px' }}
      >
        <defs>
          {/* Simple glow gradient for stroke only */}
          <radialGradient
            id="glowGradient"
            gradientUnits="userSpaceOnUse"
            r="20%"
            cx={`${mousePosition.x}%`}
            cy={`${mousePosition.y}%`}
          >
            <stop offset="0%" stopColor="#00FF9D" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Subtle glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Base text (static outline) */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth="1.5"
          className="fill-transparent font-bold stroke-gray-400 dark:stroke-gray-600"
          fontSize="100"
          fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        >
          {text}
        </text>

        {/* Glowing stroke effect - only on cursor area */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="#00FF9D"
          strokeWidth="2"
          fill="transparent"
          className="font-bold"
          fontSize="100"
          fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
          style={{
            filter: `url(#glow)`,
            mask: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, white 0%, transparent 100%)`
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export default TextHoverEffect;