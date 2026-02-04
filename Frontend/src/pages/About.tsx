import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">About</p>
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bookify
            </span>{" "}
            Experiences
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We connect fans with unforgettable moments. Tickets, merchandise, and rewards in one place.
          </p>
        </div>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>What we do</CardTitle>
            <CardDescription>
              A single platform to discover events, shop official merch, and earn loyalty points.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
                <h3 className="font-semibold mb-2">Events & Tickets</h3>
                <p className="text-sm text-muted-foreground">
                  Browse curated events and book tickets with real-time availability.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
                <h3 className="font-semibold mb-2">Merchandise</h3>
                <p className="text-sm text-muted-foreground">
                  Shop official gear with transparent stock limits and secure checkout.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
                <h3 className="font-semibold mb-2">Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Earn and redeem points across tickets and products with clear balances.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
                <h3 className="font-semibold mb-2">Organizers</h3>
                <p className="text-sm text-muted-foreground">
                  Tools for organizers to manage sales, verify payments, and view analytics.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center">Our Team</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-primary/20">
                    <img
                      src="/assets/team-ebraam.jpg"
                      alt="Ebraam Ashraf"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-lg">Ebraam Ashraf</h4>
                  <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-primary/20">
                    <img
                      src="/assets/team-ahmed.png"
                      alt="Ahmed Maged"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-lg">Ahmed Maged</h4>
                  <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-primary/20">
                    <img
                      src="/assets/team-muhammed.png"
                      alt="Muhammed Khaled"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-lg">Muhammed Khaled</h4>
                  <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-primary/20">
                    <img
                      src="/assets/team-ibrahim.png"
                      alt="Ibrahim Bakr"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-lg">Ibrahim Bakr</h4>
                  <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Have feedback?</p>
                <p className="font-semibold">Tell us what to improve.</p>
              </div>
              <Button asChild>
                <a href="mailto:bookify101@gmail.com" className="flex items-center gap-2">
                  Contact the team <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;

