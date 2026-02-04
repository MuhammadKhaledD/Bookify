import { useEffect, useRef } from "react";
import gsap from "gsap";

export const InteractiveObject = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const object = objectRef.current;
    if (!object) return;

    const ctx = gsap.context(() => {
      // Idle floating animation
      gsap.to(object, {
        y: "+=15",
        rotation: 5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, object);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      const rect = object.getBoundingClientRect();
      startPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      gsap.killTweensOf(object);
      gsap.to(object, {
        scale: 1.2,
        duration: 0.2,
        ease: "back.out",
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - startPos.current.x;
      const y = e.clientY - rect.top - startPos.current.y;
      gsap.set(object, { x, y });
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      gsap.to(object, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
          // Resume floating animation
          gsap.to(object, {
            y: "+=15",
            rotation: 5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        },
      });
    };

    object.addEventListener("mousedown", handleMouseDown as any);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    container?.addEventListener("mouseleave", handleMouseUp);

    return () => {
      ctx.revert();
      object.removeEventListener("mousedown", handleMouseDown as any);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container?.removeEventListener("mouseleave", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block w-32 h-32"
    >
      <div
        ref={objectRef}
        className="absolute top-0 left-0 w-20 h-20 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg opacity-90" />
          <div className="absolute inset-2 bg-gradient-to-br from-secondary to-accent rounded-xl shadow-inner" />
          <div className="absolute inset-4 bg-gradient-to-br from-primary/50 to-transparent rounded-lg" />
        </div>
      </div>
      <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center opacity-50 whitespace-nowrap">
        Drag me!
      </p>
    </div>
  );
};
