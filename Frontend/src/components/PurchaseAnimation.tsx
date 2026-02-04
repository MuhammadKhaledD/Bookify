import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CheckCircle, PartyPopper } from "lucide-react";

interface PurchaseAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: "ticket" | "product";
}

export const PurchaseAnimation = ({ isVisible, onComplete, type = "ticket" }: PurchaseAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const ctx = gsap.context(() => {
      // Main container fade in
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );

      // Confetti burst
      const confetti = confettiRef.current?.children;
      if (confetti) {
        gsap.fromTo(
          confetti,
          {
            opacity: 1,
            scale: 0,
            x: 0,
            y: 0,
          },
          {
            opacity: 0,
            scale: 1,
            x: () => gsap.utils.random(-150, 150),
            y: () => gsap.utils.random(-150, 50),
            rotation: () => gsap.utils.random(-360, 360),
            duration: 1.5,
            stagger: 0.05,
            ease: "power2.out",
          }
        );
      }

      // Auto close after animation
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        delay: 2.5,
        onComplete: () => {
          onComplete?.();
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const confettiColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div ref={containerRef} className="relative text-center p-8">
        {/* Confetti */}
        <div ref={confettiRef} className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: confettiColors[i % confettiColors.length],
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-bounce">
            {type === "ticket" ? (
              <PartyPopper className="w-10 h-10 text-primary-foreground" />
            ) : (
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {type === "ticket" ? "Tickets Booked!" : "Purchase Complete!"}
          </h2>
          <p className="text-muted-foreground">
            {type === "ticket"
              ? "Get ready for an amazing experience!"
              : "Your order is on its way!"}
          </p>
        </div>
      </div>
    </div>
  );
};
