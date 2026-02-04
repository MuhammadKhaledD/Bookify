import { useEffect, useRef } from "react";
import gsap from "gsap";

export const ScrollReactiveObject = () => {
  const objectRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const rotationRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      const speed = Math.min(Math.abs(delta), 20);
      
      // Rotate based on scroll direction and speed
      rotationRef.current += delta * 0.5;
      
      gsap.to(objectRef.current, {
        rotation: rotationRef.current,
        scale: 1 + (speed * 0.02),
        duration: 0.3,
        ease: "power2.out",
      });

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={objectRef}
      className="fixed bottom-8 right-8 w-12 h-12 z-40 pointer-events-none hidden md:block"
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg opacity-80" />
        <div className="absolute inset-1 bg-gradient-to-br from-background to-card rounded-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-br from-primary to-secondary rounded-full" />
        </div>
      </div>
    </div>
  );
};
