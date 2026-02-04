import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const AnimatedText = ({ text, className = "", delay = 0 }: AnimatedTextProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const words = containerRef.current?.querySelectorAll(".animated-word");
    if (!words) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        {
          opacity: 0,
          y: 20,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: 0.15,
          delay,
          ease: "power3.out",
        }
      );

      // Gradient glow effect on each word sequentially
      words.forEach((word, index) => {
        gsap.to(word, {
          backgroundPosition: "200% center",
          duration: 1.5,
          delay: delay + (index * 0.15) + 0.3,
          ease: "power2.inOut",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [text, delay]);

  const words = text.split(" ");

  return (
    <span ref={containerRef} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="animated-word inline-block mr-[0.25em] bg-gradient-to-r from-foreground via-primary to-secondary bg-[length:200%_auto] bg-clip-text"
          style={{ backgroundPosition: "0% center" }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};
