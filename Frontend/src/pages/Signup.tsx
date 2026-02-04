/**
 * Signup.tsx
 * 
 * User registration page:
 * - New user account creation form
 * - Email, password, and profile information
 * - Form validation and password confirmation
 * - Terms of service acceptance
 * 
 * Creates new user accounts for the platform
 */

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Ticket, Mail, ChevronLeft, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import api from "@/lib/api";
import gsap from "gsap";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    agreeToTerms: false,
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Animation
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".signup-content",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
      gsap.fromTo(".signup-decoration",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match!",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.name);
      formDataToSend.append("Username", formData.username);
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("Password", formData.password);
      if (formData.address) {
        formDataToSend.append("Address", formData.address);
      }
      if (profilePicture) {
        formDataToSend.append("ProfilePictureFile", profilePicture);
      }

      const response = await api.post("/auth/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setRegistrationSuccess(true);
      toast({
        title: "Registration successful!",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>

        <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-6 text-center pt-8">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10 shadow-inner">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Check Your Email
              </span>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/90">
              We've sent a confirmation link to <span className="font-semibold text-foreground">{formData.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <p className="text-sm text-muted-foreground text-center bg-accent/30 p-4 rounded-lg border border-border/50">
              Please check your email and click the confirmation link to activate your account.
              The link will expire in 7 days.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
              size="lg"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background" ref={containerRef}>
      {/* Decorative Left Side */}
      <div className="hidden lg:flex w-1/2 bg-primary/5 signup-decoration relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="inline-flex p-4 rounded-2xl bg-background/50 backdrop-blur-md border border-white/10 shadow-xl mb-6">
            <Ticket className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Community</span>
          </h1>
          <p className="text-xl text-muted-foreground/80 leading-relaxed">
            Create your account today. Unlock exclusive events, special offers, and a world of entertainment at your fingertips.
          </p>
        </div>
      </div>

      {/* Signup Form Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-y-auto max-h-screen">
        <div className="absolute top-6 left-6 signup-content z-20">
          <Button variant="ghost" asChild className="gap-2 hover:bg-transparent hover:text-primary">
            <Link to="/">
              <ChevronLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-md space-y-6 signup-content py-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create an Account</h2>
            <p className="text-muted-foreground">Enter your details to get started</p>
          </div>

          <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Your address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="mb-1 block">Profile Picture (Optional)</Label>
                  <ImageUpload
                    onImageSelect={(file) => setProfilePicture(file)}
                  />
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agreeToTerms: checked as boolean })
                    }
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline font-medium">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] mt-2"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm pb-8">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Future Improvements:
 * - Add real-time password strength indicator
 * - Implement email verification flow
 * - Add social signup options (Google, Facebook, Apple)
 * - Include profile picture upload during signup
 * - Add phone number verification
 * - Implement referral code system
 * - Add user role selection (attendee, organizer)
 * - Include welcome email automation
 */
