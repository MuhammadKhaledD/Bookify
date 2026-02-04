import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
  category: string;
  featured?: boolean;
  points?: number | null;  // Loyalty points earned
}

export const EventCard = ({
  id,
  title,
  date,
  location,
  price,
  image,
  category,
  featured,
  points,
}: EventCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const card = cardRef.current;

    const image = imageRef.current;
    const content = contentRef.current;
    const titleEl = titleRef.current;
    const detailsEl = detailsRef.current;
    const badgesEl = badgesRef.current;

    if (!card || !image || !content) return;

    let mouseInCard = false;
    let lastMouseMoveTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mouse move to every 16ms (~60fps)
      const now = Date.now();
      if (now - lastMouseMoveTime < 16) return;
      lastMouseMoveTime = now;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only animate if mouse is inside card
      if (
        x >= 0 &&
        x <= rect.width &&
        y >= 0 &&
        y <= rect.height &&
        mouseInCard
      ) {
        // Calculate rotation based on mouse position (3D perspective)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 5; // Reduced from 8
        const rotateX = ((centerY - y) / centerY) * 5; // Reduced from 8

        // 3D perspective rotation
        gsap.to(content, {
          rotationX: rotateX,
          rotationY: rotateY,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const handleMouseEnter = () => {
      mouseInCard = true;

      // Image zoom with rotation
      gsap.to(image, {
        scale: 1.1, // Reduced from 1.15
        duration: 0.6,
        ease: "back.out(1.2)",
      });

      // Card lift with enhanced shadow
      gsap.to(card, {
        y: -8, // Reduced from -12
        duration: 0.3, // Faster, smoother
        ease: "power2.out", // Less bouncy than back.out
      });

      // Deep shadow glow - softer
      gsap.to(content, {
        boxShadow:
          "0 20px 50px rgba(var(--primary-rgb), 0.25), 0 0 30px rgba(var(--primary-rgb), 0.1)", // Matched RewardCard
        duration: 0.3,
      });

      // Stagger text animations
      if (titleEl) {
        gsap.fromTo(
          titleEl,
          { y: 0, opacity: 1 },
          {
            y: -2,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      }

      if (detailsEl) {
        gsap.fromTo(
          detailsEl,
          { opacity: 0.8 },
          {
            opacity: 1,
            duration: 0.3,
            delay: 0.05,
            ease: "power2.out",
          }
        );
      }

      // Badge animation
      if (badgesEl) {
        gsap.to(badgesEl, {
          y: -2,
          duration: 0.3,
          delay: 0.1,
          ease: "back.out(1.2)",
        });
      }
    };

    const handleMouseLeave = () => {
      mouseInCard = false;
      // Reset all animations immediately
      gsap.killTweensOf(image);
      gsap.killTweensOf(card);
      gsap.killTweensOf(content);
      gsap.killTweensOf(titleEl);
      gsap.killTweensOf(detailsEl);
      gsap.killTweensOf(badgesEl);

      gsap.to(image, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(card, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(content, {
        boxShadow: "0 0px 0px rgba(0, 0, 0, 0)",
        rotationX: 0,
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      if (titleEl) {
        gsap.to(titleEl, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (detailsEl) {
        gsap.to(detailsEl, {
          opacity: 0.8,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (badgesEl) {
        gsap.to(badgesEl, {
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    // Scroll animation - cards slide in from left with scale (Matched RewardCard)
    let hasAnimated = false;

    const scrollTrigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: "top center+=80", // Matched RewardCard
      once: false,
      toggleActions: "play none none none", // Matched RewardCard (no reverse on up scroll)
      onEnter: () => {
        if (hasAnimated) return;
        hasAnimated = true;

        gsap.fromTo(
          cardRef.current,
          {
            x: -50, // Subtle slide from left
            opacity: 0,
            scale: 0.95
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.2)", // Matched RewardCard
          }
        );
      },
    });

    // Overlay animation on hover
    const overlay = overlayRef.current;
    if (overlay) {
      card.addEventListener("mouseenter", () => {
        gsap.to(overlay, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      });
    }

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      scrollTrigger.kill();
      // Kill all tweens to prevent stuck animations on unmount
      gsap.killTweensOf(image);
      gsap.killTweensOf(card);
      gsap.killTweensOf(content);
      gsap.killTweensOf(titleEl);
      gsap.killTweensOf(detailsEl);
      gsap.killTweensOf(badgesEl);
    };
  }, []);

  return (
    <div ref={cardRef} className="relative group">


      <div
        ref={contentRef}
        className="relative z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className="overflow-hidden border-border">
          <Link to={`/events/${id}`} className="block">
            <div className="relative overflow-hidden aspect-video">
              <img
                ref={imageRef}
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div
                ref={overlayRef}
                className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80 opacity-0 flex items-center justify-center backdrop-blur-sm"
              >
                <Button className="bg-white text-primary hover:bg-white/90 font-semibold">
                  View Details
                </Button>
              </div>
              <div
                ref={badgesRef}
                className="absolute top-3 left-0 right-0 flex justify-between px-3"
              >
                {featured && (
                  <Badge className="bg-accent text-accent-foreground border-0">
                    Featured
                  </Badge>
                )}
                <div className="flex gap-2 ml-auto">
                  <Badge className="bg-background/90 text-foreground border-0">
                    {category}
                  </Badge>
                  {points !== undefined && points !== null && points > 0 && (
                    <Badge className="bg-primary text-primary-foreground border-0">
                      +{points} pts
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 md:p-5 space-y-2 md:space-y-3 bg-card">
              <h3
                ref={titleRef}
                className="font-semibold text-base md:text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-2"
              >
                {title}
              </h3>

              <div
                ref={detailsRef}
                className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">{date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{location}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 md:pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                  <span className="font-semibold text-base md:text-lg text-primary">
                    {price}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="pointer-events-none text-xs md:text-sm w-full sm:w-auto"
                >
                  View Details
                </Button>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
};
