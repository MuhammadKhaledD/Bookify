/**
 * Checkout.tsx
 * 
 * Checkout page that:
 * - Creates order from cart (POST /api/orders/checkout)
 * - Redirects to orders page where user can add payment
 * 
 * Simplified checkout flow - payment is added separately after order creation
 */

import { useState, useEffect } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Automatically create order when page loads
    handleCheckout();
  }, [isAuthenticated, navigate]);

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      
      // POST /api/orders/checkout - Creates order from cart
      const response = await api.post("/orders/checkout");
      
      toast({
        title: "Order created successfully!",
        description: `Order #${response.data.id} has been created. Please add payment method.`,
      });
      
      // Navigate to orders page
      navigate("/orders");
    } catch (error: any) {
      console.error("Error during checkout:", error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Cart is empty or not found.";
        toast({
          title: "Checkout failed",
          description: message,
          variant: "destructive",
        });
        navigate("/cart");
      } else {
        toast({
          title: "Checkout failed",
          description: error.response?.data?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            {processing ? (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Processing your order...</h2>
                <p className="text-muted-foreground">
                  Creating order from your cart items.
                </p>
              </>
            ) : (
              <>
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Redirecting...</h2>
                <p className="text-muted-foreground">
                  Please wait while we redirect you to your orders.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Future Improvements:
 * - Integrate real payment processors (Stripe, PayPal)
 * - Add billing address separate from contact info
 * - Implement saved payment methods
 * - Add guest checkout option
 * - Include order notes/special instructions field
 * - Add alternative payment methods (digital wallets, buy now pay later)
 * - Implement shipping address for physical products
 * - Add order review step before final submission
 * - Include terms and conditions acceptance
 * - Add promo code validation with dynamic updates
 */
