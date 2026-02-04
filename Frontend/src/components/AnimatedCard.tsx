import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard = ({ children, className = "", delay = 0 }: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      // Scroll-triggered fade in
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [delay]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    const border = borderRef.current;
    if (!card || !border) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update gradient position
    border.style.background = `radial-gradient(circle at ${x}px ${y}px, hsl(var(--primary)), hsl(var(--secondary)), transparent 70%)`;
  };

  const handleMouseEnter = () => {
    const border = borderRef.current;
    if (border) {
      gsap.to(border, { opacity: 1, duration: 0.3 });
    }
  };

  const handleMouseLeave = () => {
    const border = borderRef.current;
    if (border) {
      gsap.to(border, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated gradient border */}
      <div
        ref={borderRef}
        className="absolute -inset-[2px] rounded-xl opacity-0 pointer-events-none transition-opacity"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
        }}
      />

      {/* Card content with slight inner offset */}
      <div className="relative bg-card rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
};
