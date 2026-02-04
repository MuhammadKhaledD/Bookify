import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Package, Tag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  organizationName: string;
  stockQuantity: number;
  limitPerUser: number;
  pointsEarned: number;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  discount,
  image,
  organizationName,
  stockQuantity,
  limitPerUser,
  pointsEarned,
}: ProductCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;

    const image = imageRef.current;
    const content = contentRef.current;
    const titleEl = titleRef.current;
    const descriptionEl = descriptionRef.current;
    const detailsEl = detailsRef.current;
    const badgesEl = badgesRef.current;
    const priceEl = priceRef.current;

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
        scale: 1.1,
        duration: 0.6,
        ease: "back.out(1.2)",
      });

      // Card lift with enhanced shadow
      gsap.to(card, {
        y: -8,
        duration: 0.3,
        ease: "power2.out",
      });

      // Deep shadow glow effect
      gsap.to(content, {
        boxShadow:
          "0 20px 50px rgba(var(--primary-rgb), 0.25), 0 0 30px rgba(var(--primary-rgb), 0.1)",
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

      if (descriptionEl) {
        gsap.fromTo(
          descriptionEl,
          { opacity: 0.7 },
          {
            opacity: 1,
            duration: 0.3,
            delay: 0.05,
            ease: "power2.out",
          }
        );
      }

      if (detailsEl) {
        gsap.to(detailsEl, {
          opacity: 1,
          duration: 0.3,
          delay: 0.1,
          ease: "power2.out",
        });
      }

      // Badge animation with bounce
      if (badgesEl) {
        gsap.to(badgesEl, {
          y: -2,
          duration: 0.3,
          delay: 0.1,
          ease: "back.out(1.2)",
        });
      }

      // Price animation
      if (priceEl) {
        gsap.to(priceEl, {
          scale: 1.05,
          duration: 0.3,
          delay: 0.15,
          ease: "back.out(1.2)",
        });
      }
    };

    const handleMouseLeave = () => {
      mouseInCard = false;
      // Kill all tweens immediately to prevent lingering animations
      gsap.killTweensOf(image);
      gsap.killTweensOf(card);
      gsap.killTweensOf(content);
      gsap.killTweensOf(titleEl);
      gsap.killTweensOf(descriptionEl);
      gsap.killTweensOf(detailsEl);
      gsap.killTweensOf(badgesEl);
      gsap.killTweensOf(priceEl);

      // Reset all animations smoothly
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
          duration: 0.2,
          ease: "power2.out",
        });
      }

      if (descriptionEl) {
        gsap.to(descriptionEl, {
          opacity: 0.7,
          duration: 0.2,
          ease: "power2.out",
        });
      }

      if (detailsEl) {
        gsap.to(detailsEl, {
          opacity: 0.8,
          duration: 0.2,
          ease: "power2.out",
        });
      }

      if (badgesEl) {
        gsap.to(badgesEl, {
          y: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      }

      if (priceEl) {
        gsap.to(priceEl, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    };

    // Scroll animation - cards slide in from left when scrolling down, from right when scrolling up
    gsap.registerPlugin(ScrollTrigger);
    let lastScrollY = window.scrollY;
    let hasAnimated = false;

    const scrollTrigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: "top center+=80",
      once: false,
      toggleActions: "play none none none",
      onEnter: () => {
        if (hasAnimated) return;
        hasAnimated = true;

        gsap.fromTo(
          cardRef.current,
          {
            x: -50,
            opacity: 0,
            scale: 0.95
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.2)",
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
          ease: "power2.out",
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
      gsap.killTweensOf(descriptionEl);
      gsap.killTweensOf(detailsEl);
      gsap.killTweensOf(badgesEl);
      gsap.killTweensOf(priceEl);
    };
  }, []);

  const discountedPrice =
    discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : price.toFixed(2);

  return (
    <div ref={cardRef} className="relative group">


      <div
        ref={contentRef}
        className="relative z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className="overflow-hidden border-border">
          {/* Gradient line at top on hover - matches home page */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          <Link to={`/product/${id}`} className="block">
            <div className="relative overflow-hidden aspect-video">
              <img
                ref={imageRef}
                src={image}
                alt={name}
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
                {discount > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    -{discount}%
                  </Badge>
                )}
                <Badge className="bg-background/90 text-foreground border-0 ml-auto">
                  <Star className="h-3 w-3 mr-1 fill-primary text-primary" />+
                  {pointsEarned} pts
                </Badge>
              </div>
            </div>
            <div className="p-4 md:p-5 space-y-2 md:space-y-3">
              <h3
                ref={titleRef}
                className="font-semibold text-base md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2"
              >
                {name}
              </h3>

              <p
                ref={descriptionRef}
                className="text-xs md:text-sm text-muted-foreground line-clamp-2"
              >
                {description}
              </p>

              <div
                ref={detailsRef}
                className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{organizationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>{stockQuantity} in stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>Limit: {limitPerUser} per user</span>
                </div>
              </div>

              <div
                ref={priceRef}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 md:pt-3 border-t border-border"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      discount > 0
                        ? "line-through text-xs text-muted-foreground"
                        : "font-semibold text-base md:text-lg text-primary"
                    }
                  >
                    {price.toFixed(2)} EGP
                  </span>
                  {discount > 0 && (
                    <span className="font-semibold text-base md:text-lg text-primary">
                      {discountedPrice} EGP
                    </span>
                  )}
                </div>
                <Button size="sm" className="pointer-events-none text-xs md:text-sm w-full sm:w-auto">
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
