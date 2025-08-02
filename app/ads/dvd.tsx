import React, { useState, useEffect, useRef } from 'react';

// --- Bouncing DVD Logo Component ---
// This self-contained component creates the classic bouncing logo effect.
const BouncingDVDLogo = () => {
  // State for the logo's position (top, left)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // State for the logo's direction vector
  const [direction, setDirection] = useState({ dx: 1, dy: 1 });
  // Ref to hold the animation frame request
  const animationFrameRef = useRef<number | null>(null);
  // Ref to the bouncing element itself to get its dimensions
  const logoRef = useRef<HTMLDivElement>(null);
  // Speed of the bouncing logo (pixels per frame)
  const speed = 2;

  // The main animation loop
  useEffect(() => {
    const animate = () => {
      setPosition(prevPosition => {
        const logoElement = logoRef.current;
        if (!logoElement) return prevPosition;

        // Get the dimensions of the logo and the window
        const logoRect = logoElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let newDx = direction.dx;
        let newDy = direction.dy;

        // Calculate the new position
        let nextX = prevPosition.x + newDx * speed;
        let nextY = prevPosition.y + newDy * speed;

        // --- Boundary Collision Detection ---
        // Check for collision with the right or left wall
        if (nextX + logoRect.width >= windowWidth || nextX <= 0) {
          newDx *= -1; // Reverse horizontal direction
        }

        // Check for collision with the bottom or top wall
        if (nextY + logoRect.height >= windowHeight || nextY <= 0) {
          newDy *= -1; // Reverse vertical direction
        }

        // Update direction state if it has changed
        if (newDx !== direction.dx || newDy !== direction.dy) {
          setDirection({ dx: newDx, dy: newDy });
        }
        
        // Clamp position to stay within bounds
        nextX = Math.max(0, Math.min(nextX, windowWidth - logoRect.width));
        nextY = Math.max(0, Math.min(nextY, windowHeight - logoRect.height));

        return { x: nextX, y: nextY };
      });

      // Request the next animation frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // --- Cleanup Function ---
    // This function is called when the component unmounts
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [direction, speed]); // Rerun effect if direction or speed changes

  return (
    <div
      ref={logoRef}
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        color: 'white',
        backgroundColor: 'black',
        padding: '5px 10px',
        fontWeight: 'bold',
        fontSize: '24px',
        border: '2px solid white',
        userSelect: 'none', // Prevent text selection
        fontFamily: 'monospace',
        zIndex: 9999, // Add a high z-index to ensure it's on top
      }}
    >
      DVD
    </div>
  );
};

export default BouncingDVDLogo;