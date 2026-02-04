import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Ticket } from "lucide-react";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(logoRef.current, { scale: 0.8, opacity: 0 });
      gsap.set(textRef.current, { y: 20, opacity: 0 });
      gsap.set(progressRef.current, { scaleX: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => onComplete?.()
          });
        }
      });

      tl.to(logoRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
      })
        .to(textRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out"
        }, "-=0.4")
        .to(progressRef.current, {
          scaleX: 1,
          duration: 1.5,
          ease: "power1.inOut"
        })
        .to([logoRef.current, textRef.current, progressRef.current], {
          scale: 1.1,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in"
        });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Logo Container */}
        <div
          ref={logoRef}
          className="relative p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-sm border border-primary/20 shadow-2xl shadow-primary/20"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl animate-pulse" />
          <Ticket className="w-16 h-16 text-primary relative z-10" />
        </div>

        {/* Brand Name */}
        <div ref={textRef} className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bookify
            </span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
            Experience Extraordinary
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-4">
          <div
            ref={progressRef}
            className="h-full w-full bg-gradient-to-r from-primary to-secondary origin-left"
          />
        </div>
      </div>
    </div>
  );
};

