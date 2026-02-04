import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Ticket, Menu, LogOut, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  isAdmin,
  isOrganizer,
  isUser,
  canAccessOrganizer,
  canAccessAdmin,
  canAddToCart,
} from "@/utils/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, roles } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check permissions
  const showCart = isAuthenticated && canAddToCart(roles);
  const showOrganizerDashboard = isAuthenticated && canAccessOrganizer(roles);
  const showAdminDashboard = isAuthenticated && canAccessAdmin(roles);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-300"
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={handleNavClick}>
            <Ticket className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bookify
            </span>
          </Link>

          {/* Desktop Navigation - Direct Links */}
          <div className="hidden md:flex items-center gap-1">
            {/* Always show Events & Store */}
            <Link
              to="/events"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/events")
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:text-primary hover:bg-muted"
                }`}
              onClick={handleNavClick}
            >
              Events
            </Link>
            <Link
              to="/store"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/store")
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:text-primary hover:bg-muted"
                }`}
              onClick={handleNavClick}
            >
              Store
            </Link>

            {/* Role-specific navigation */}
            {showOrganizerDashboard ? (
              <>
                {/* Organizer Navigation - User Features + Organizer Statistics + About (About last) */}
                <Link
                  to="/cart"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/cart")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Cart
                </Link>
                <Link
                  to="/rewards"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/rewards")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Rewards
                </Link>
                <Link
                  to="/redemptions"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/redemptions")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Redemptions
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/orders")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Orders
                </Link>
                {showAdminDashboard && (
                  <>
                  </>
                )}
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/about")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  About
                </Link>
              </>
            ) : showAdminDashboard ? (
              <>
                {/* Admin Navigation - Statistics + About (About last) */}
                <Link
                  to="/admin/statistics"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/admin/statistics")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Statistics
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/about")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  About
                </Link>
              </>
            ) : isAuthenticated ? (
              <>
                {/* Authenticated User Navigation - About last */}
                <Link
                  to="/cart"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/cart")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Cart
                </Link>
                <Link
                  to="/rewards"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/rewards")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Rewards
                </Link>
                <Link
                  to="/redemptions"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/redemptions")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Redemptions
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/orders")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  Orders
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/about")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  About
                </Link>
              </>
            ) : (
              <>
                {/* Non-authenticated Navigation */}
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath("/about")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                  onClick={handleNavClick}
                >
                  About
                </Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle - Desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <>
                {showCart && (
                  <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
                    <Link to="/cart">
                      <ShoppingCart className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profilePicture} alt={user?.name || user?.userName} />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || user?.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
                            {user?.name || user?.userName}
                          </span>
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    {showOrganizerDashboard && (
                      <DropdownMenuItem asChild>
                        <Link to="/org/dashboard">Organizer Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    {showAdminDashboard && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
                  <Link to="/login">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">Log In</span>
                  </Link>
                </Button>
                <Button size="sm" className="hidden md:flex bg-gradient-to-r from-primary to-secondary border-0 hover:opacity-90 transition-opacity" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {/* Always show */}
              <Link
                to="/events"
                onClick={handleNavClick}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/events")
                  ? "text-primary bg-primary/10"
                  : "text-foreground hover:text-primary hover:bg-muted"
                  }`}
              >
                Events
              </Link>
              <Link
                to="/store"
                onClick={handleNavClick}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/store")
                  ? "text-primary bg-primary/10"
                  : "text-foreground hover:text-primary hover:bg-muted"
                  }`}
              >
                Store
              </Link>

              {/* Role-specific */}
              {showAdminDashboard ? (
                <>
                  <Link to="/admin/dashboard" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/admin/dashboard") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/users" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/admin/users") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                    Manage Users
                  </Link>
                </>
              ) : showOrganizerDashboard ? (
                <>
                  <Link to="/org/dashboard" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/org/dashboard") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                    Organizer Dashboard
                  </Link>
                </>
              ) : isAuthenticated ? (
                <>
                  <Link to="/about" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/about") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                    About
                  </Link>
                  <Link to="/rewards" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/rewards") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                    Rewards
                  </Link>
                  <Link to="/orders" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/orders") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                    Orders
                  </Link>
                </>
              ) : (
                <Link to="/about" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/about") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                  About
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  {showCart && (
                    <Link
                      to="/cart"
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/cart") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Cart
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/profile") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>

                  {showAdminDashboard && (
                    <>
                      <div className="border-t border-border mt-2 pt-2">
                        <p className="text-xs text-muted-foreground px-3 py-1">Admin</p>
                      </div>
                      <Link to="/admin/dashboard" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/admin/dashboard") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                        Dashboard
                      </Link>
                      <Link to="/admin/users" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/admin/users") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                        Manage Users
                      </Link>
                      <Link to="/admin/categories" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/admin/categories") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                        Manage Categories
                      </Link>
                      <Link to="/admin/payments" onClick={handleNavClick} className={`flex items-center gap-3 p-3 rounded-md transition-colors font-medium ${isActivePath("/admin/payments") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>
                        Payment Verification
                      </Link>
                    </>
                  )}

                  <div className="flex items-center justify-between py-2 border-t border-border mt-2 pt-4">
                    <span className="text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-destructive hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-2 border-t border-border mt-2 pt-4">
                    <span className="text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="flex-1" asChild>
                      <Link to="/login" onClick={handleNavClick}>
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">Log In</span>
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary border-0 hover:opacity-90 transition-opacity" asChild>
                      <Link to="/signup" onClick={handleNavClick}>Sign Up</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

