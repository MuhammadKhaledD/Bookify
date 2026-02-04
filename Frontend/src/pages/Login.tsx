/**
 * Login.tsx
 * 
 * User authentication login page:
 * - Email and password login form
 * - Form validation
 * - Link to signup page for new users
 * - Password recovery option
 * 
 * Provides secure access to user accounts
 */

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
import api from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import gsap from "gsap";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Animation
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".login-content",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
      gsap.fromTo(".login-decoration",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Save access token and user to Redux
      const accessToken = response.data.accessToken || response.data.access_token;
      if (accessToken) {
        // Roles are decoded from the token automatically by the reducer
        dispatch(setCredentials({
          accessToken,
          user: response.data.user,
        }));
      }

      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });

      // Redirect to home page
      navigate("/");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background" ref={containerRef}>
      {/* Decorative Left Side */}
      <div className="hidden lg:flex w-1/2 bg-primary/5 login-decoration relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="inline-flex p-4 rounded-2xl bg-background/50 backdrop-blur-md border border-white/10 shadow-xl mb-6">
            <Ticket className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground">
            Discover Extraordinary <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground/80 leading-relaxed">
            Join thousands of event enthusiasts. Book tickets, earn rewards, and create memories that last a lifetime.
          </p>
        </div>
      </div>

      {/* Login Form Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative">
        <div className="absolute top-6 left-6 login-content">
          <Button variant="ghost" asChild className="gap-2 hover:bg-transparent hover:text-primary">
            <Link to="/">
              <ChevronLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-md space-y-8 login-content">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-base">Password</Label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base bg-background/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Unlock Access"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
}

/**
 * Future Improvements:
 * - Integrate with backend authentication system
 * - Add social login options (Google, Facebook, Apple)
 * - Implement remember me functionality
 * - Add two-factor authentication
 * - Include CAPTCHA for security
 * - Add password strength indicator
 * - Implement session management
 * - Add biometric login support for mobile
 */
