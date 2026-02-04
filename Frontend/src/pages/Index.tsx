/**
 * Index.tsx
 *
 * Landing page for Bookify platform featuring:
 * - Hero section with main value proposition
 * - Features section highlighting key benefits
 * - How it works section explaining the process
 * - Stats section showing platform metrics
 * - Call-to-action for getting started
 *
 * No backend data required - purely informational
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Ticket,
  Gift,
  ShoppingBag,
  ArrowRight,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedCard } from "@/components/AnimatedCard";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Snowfall from "react-snowfall";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.fromTo(".hero-element",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" }
      );

      // Stats animation
      const stats = statsRef.current?.querySelectorAll(".stat-item");
      if (stats) {
        gsap.fromTo(
          stats,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top bottom-=100",
            },
          }
        );
      }

      // Steps animation
      const steps = stepsRef.current?.querySelectorAll(".step-item");
      if (steps) {
        gsap.fromTo(
          steps,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top bottom-=100",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Snowfall Effect */}
      <Snowfall
        color="#dee4fd"
        snowflakeCount={500}
      />

      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-4 pb-12 md:pt-12 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-6">


            <h1 className="hero-element text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight">
              {isAuthenticated ? (
                <>
                  <span className="block text-foreground">Welcome back,</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {user?.name || user?.userName || "User"}
                  </span>
                </>
              ) : (
                <>
                  <AnimatedText text="Discover" />
                  <br />
                  <span className="inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
                    Extraordinary Events
                  </span>
                  <span className="block text-foreground">Events</span>
                </>
              )}
            </h1>

            <p className="hero-element text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-light">
              {isAuthenticated
                ? "Continue your journey. Browse new events, check your rewards, and discover exclusive merchandise tailored just for you."
                : "Your gateway to unforgettable experiences. Book tickets, earn exclusive rewards, and shop official merchandise all in one premium ecosystem."}
            </p>

            <div className="hero-element flex flex-col sm:flex-row gap-5 justify-center pt-8">
              <Link to="/events">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)] hover:-translate-y-1 transition-all duration-300">
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to={isAuthenticated ? "/profile" : "/signup"}>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-accent hover:-translate-y-1 transition-all duration-300">
                  {isAuthenticated ? "My Dashboard" : "Get Started"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="py-12 relative z-10">
        <div ref={statsRef} className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { label: "Active Events", value: "10K+", color: "text-primary" },
              { label: "Trusted Organizers", value: "500+", color: "text-purple-500" },
              { label: "Happy Attendees", value: "1M+", color: "text-secondary" }
            ].map((stat, i) => (
              <div key={i} className="stat-item relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-background to-accent/50 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-8 rounded-2xl border border-border/50 bg-background/40 backdrop-blur-sm text-center transform transition-transform group-hover:scale-105 duration-300 shadow-sm">
                  <div className={`text-5xl md:text-6xl font-black ${stat.color} mb-2 tracking-tighter`}>
                    {stat.value}
                  </div>
                  <p className="text-lg font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32">
        <div ref={featuresRef} className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Why <span className="text-primary">Bookify</span>?
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              We've reimagined the event experience from the ground up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
            <AnimatedCard delay={0}>
              <Card className="h-full border-none bg-gradient-to-b from-accent/50 to-background shadow-lg hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-10 pb-8 px-8 space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Ticket className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold">Seamless Booking</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Experience the fastest checkout in the industry. Secure, reliable, and designed for speed.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.15}>
              <Card className="h-full border-none bg-gradient-to-b from-accent/50 to-background shadow-lg hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-10 pb-8 px-8 space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                    <Gift className="h-8 w-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold">Smart Rewards</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Earn points on every purchase. Unlock VIP access, discounts, and exclusive perks automatically.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <Card className="h-full border-none bg-gradient-to-b from-accent/50 to-background shadow-lg hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-10 pb-8 px-8 space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                    <ShoppingBag className="h-8 w-8 text-secondary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold">Premium Store</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Get official merchandise from your favorite artists and events directly through the platform.
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* How It Works with Steps */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        {/* Decorative line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden md:block" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple steps to your next great memory</p>
          </div>

          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { num: "01", title: "Join", desc: "Create your free account instantly." },
              { num: "02", title: "Discover", desc: "Browse thousands of curated events." },
              { num: "03", title: "Book", desc: "Secure tickets in seconds." },
              { num: "04", title: "Enjoy", desc: "Attend and earn rewards." }
            ].map((step, i) => (
              <div key={i} className="step-item relative bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow text-center z-10">
                <div className="text-6xl font-black text-muted/20 absolute top-4 left-4 select-none">{step.num}</div>
                <div className="relative z-10 mt-8">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA - Only show to non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
              Ready to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Experience More?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join the community today. No credit card required to browse.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="h-16 px-10 text-xl rounded-full shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/events" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-6 py-3 font-medium">
                <Play className="w-4 h-4 fill-current group-hover:text-primary transition-colors" /> Watch Demo
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
