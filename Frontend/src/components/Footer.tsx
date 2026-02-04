import { Link } from "react-router-dom";
import { Ticket, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border mt-auto bg-muted/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Ticket className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Bookify
              </span>
            </Link>
            <span className="hidden md:inline text-muted-foreground/30 mx-2">|</span>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Bookify. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Events
            </Link>
            <Link to="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Store
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
          </div>

          <div className="flex gap-2 items-center">
            <a href="mailto:bookify101@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              <span>bookify101@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
