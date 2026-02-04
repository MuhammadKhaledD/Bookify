import { useRef, useEffect } from "react";
import { Award, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface RewardCardProps {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: string;
  discount: number;
  expireDate: string;
  expired: boolean;
  canRedeem: boolean;
  isRedeeming: boolean;
  isAuthenticated: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  onRedeem: () => void;
  buttonText: string;
}

export const RewardCard = ({
  id,
  name,
  description,
  pointsRequired,
  rewardType,
  discount,
  expireDate,
  expired,
  canRedeem,
  isRedeeming,
  isAuthenticated,
  Icon,
  onRedeem,
  buttonText,
}: RewardCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const card = cardRef.current;
    const content = contentRef.current;
    const header = headerRef.current;
    const icon = iconRef.current;

    if (!card || !content) return;

    let mouseInCard = false;
    let lastMouseMoveTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInCard) return;

      const now = Date.now();
      if (now - lastMouseMoveTime < 16) return;
      lastMouseMoveTime = now;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 5;
        const rotateX = ((centerY - y) / centerY) * 5;

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

      gsap.to(card, {
        y: -8,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(card, {
        boxShadow:
          "0 20px 50px rgba(var(--primary-rgb), 0.25), 0 0 30px rgba(var(--primary-rgb), 0.1)",
        duration: 0.3,
      });

      if (icon) {
        gsap.to(icon, {
          rotation: 360,
          duration: 0.6,
          ease: "back.out(1.2)",
        });
      }

      if (header) {
        gsap.to(header, {
          color: "hsl(var(--primary))",
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      mouseInCard = false;

      // Kill any in-progress tweens so effects don't get "stuck"
      gsap.killTweensOf(card);
      gsap.killTweensOf(content);
      gsap.killTweensOf(header);
      gsap.killTweensOf(icon);

      // Reset card position
      gsap.to(card, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset shadow
      gsap.to(card, {
        boxShadow: "0 0px 0px rgba(0, 0, 0, 0)",
        duration: 0.3,
      });

      // Reset content rotation
      gsap.to(content, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset icon
      if (icon) {
        gsap.to(icon, {
          rotation: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }

      // Reset header color
      if (header) {
        gsap.to(header, {
          color: "inherit",
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    // Scroll animation - cards slide in from left with scale
    gsap.fromTo(
      card,
      { x: -100, opacity: 0, scale: 0.95 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: card,
          start: "top center+=80",
          toggleActions: "play none none none",
        },
      }
    );

    // Icon rotation animation on scroll entrance
    if (icon) {
      gsap.fromTo(
        icon,
        { rotation: -45, opacity: 0 },
        {
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: card,
            start: "top center+=80",
            toggleActions: "play none none none",
          },
        }
      );
    }

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);

      // Kill all GSAP tweens
      gsap.killTweensOf(card);
      gsap.killTweensOf(content);
      gsap.killTweensOf(header);
      gsap.killTweensOf(icon);

      // Kill all scroll triggers for this card
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === card) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <Card
      ref={cardRef}
      className={`overflow-hidden transition-all flex flex-col h-full ${expired ? "border-destructive opacity-75" : ""
        }`}
    >
      <div
        ref={contentRef}
        style={{ transformStyle: "preserve-3d" }}
        className="flex flex-col h-full"
      >
        <CardHeader ref={headerRef}>
          <div
            ref={iconRef}
            className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4"
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-lg">{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {expired && <p className="text-xs text-destructive mt-2">Expired</p>}
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-primary">
                {pointsRequired}
              </span>
              <span className="text-sm text-muted-foreground">points</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Percent className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  {discount}% discount
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <p>Expires: {expireDate}</p>
              <p className="mt-1">Type: {rewardType}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-auto pointer-events-auto">
          <Button
            className="w-full"
            disabled={expired || isRedeeming || (isAuthenticated && !canRedeem)}
            onClick={onRedeem}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};
