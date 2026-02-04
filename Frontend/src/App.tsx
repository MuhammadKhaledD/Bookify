import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthInitializer } from "@/components/AuthInitializer";
import { ScrollReactiveObject } from "@/components/ScrollReactiveObject";
import { ThemedCursor } from "@/components/ThemedCursor";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { store } from "@/store/store";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Store from "./pages/Store";
import ShopDetail from "./pages/ShopDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Redemptions from "./pages/Redemptions";
import OrgDashboard from "./pages/OrgDashboard";
import OrgStatistics from "./pages/org/OrgStatistics";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentVerification from "./pages/admin/PaymentVerification";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminOrganizers from "./pages/admin/AdminOrganizers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminRewards from "./pages/admin/AdminRewards";
import CategoryManage from "./pages/admin/CategoryManage";
import AdminUsers from "./pages/admin/AdminUsers";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage
    const theme = localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.add(theme);
  }, []);

  // Mouse tracking for card hover effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('[class*="card"]:not(.rewards-card):not([class*="reward"])');

      cards.forEach(card => {
        const htmlCard = card as HTMLElement;
        const rect = htmlCard.getBoundingClientRect();

        // Check if mouse is over this card
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;

          htmlCard.style.setProperty('--mouse-x', `${x}%`);
          htmlCard.style.setProperty('--mouse-y', `${y}%`);
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowContent(true);
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
          <BrowserRouter>
            <AuthInitializer />
            <ThemedCursor />
            <ScrollReactiveObject />
            <div className={`flex flex-col min-h-screen ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
              <Header />
              <main className="flex-1">
                <PageTransition>
                  <Routes>
                    {/* Public routes - accessible to all */}
                    <Route path="/" element={<Index />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/store/:id" element={<ShopDetail />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/confirm-email" element={<ConfirmEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    {/* Alternative routes for backend email links */}
                    <Route path="/resetpassword" element={<ResetPassword />} />
                    <Route path="/ResetPassword" element={<ResetPassword />} />

                    {/* User routes - require User role (cart/checkout not for organizers alone) */}
                    <Route path="/cart" element={
                      <ProtectedRoute requireAuth requireRole="User">
                        <Cart />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute requireAuth requireRole="User">
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute requireAuth requireRole="User">
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/rewards" element={
                      <ProtectedRoute requireAuth requireRole="User">
                        <Rewards />
                      </ProtectedRoute>
                    } />
                    <Route path="/redemptions" element={
                      <ProtectedRoute requireAuth requireRole="User">
                        <Redemptions />
                      </ProtectedRoute>
                    } />

                    {/* Profile - any authenticated user */}
                    <Route path="/profile" element={
                      <ProtectedRoute requireAuth>
                        <Profile />
                      </ProtectedRoute>
                    } />

                    {/* Organization routes - require Organizer role */}
                    <Route path="/org/dashboard" element={
                      <ProtectedRoute requireAuth requireRole={["Organizer", "Admin"]}>
                        <OrgDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/org/statistics" element={
                      <ProtectedRoute requireAuth requireRole={["Organizer", "Admin"]}>
                        <OrgStatistics />
                      </ProtectedRoute>
                    } />

                    {/* Admin routes - require Admin role */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute requireAuth requireRole="Admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <ProtectedRoute requireAuth requireRole="Admin">
                        <AdminUsers />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/payments" element={
                      <ProtectedRoute requireAuth requireRole="Admin">
                        <PaymentVerification />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/statistics" element={
                      <ProtectedRoute requireAuth requireRole="Admin">
                        <AdminStatistics />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/categories" element={
                      <ProtectedRoute requireAuth requireRole="Admin">
                        <CategoryManage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/events" element={
                      <ProtectedRoute requireAuth requireRole="Organizer">
                        <AdminEvents />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/organizations" element={
                      <ProtectedRoute requireAuth requireRole="Admin">
                        <AdminOrganizers />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/products" element={
                      <ProtectedRoute requireAuth requireRole="Organizer">
                        <AdminProducts />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/rewards" element={
                      <ProtectedRoute requireAuth requireRole="Admin">
                        <AdminRewards />
                      </ProtectedRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
