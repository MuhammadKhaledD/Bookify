import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<SVGGElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    setIsTransitioning(true);
    setDisplayContent(false);

    // Very smooth, subtle transition - fade in/out quickly
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setDisplayContent(true);
    }, 200); // Very short delay - almost imperceptible

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isTransitioning) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: 0 }}
      />
    );
  }

  return (
    <div ref={containerRef} className={displayContent ? "animate-fade-in" : "opacity-0"}>
      {children}
    </div>
  );
};

