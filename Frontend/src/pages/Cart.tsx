/**
 * Cart.tsx
 * 
 * Shopping cart page featuring:
 * - List of tickets and products added to cart
 * - Quantity adjustment controls (increase/decrease)
 * - Remove item functionality
 * - Order summary with subtotal, fees, and total
 * - Empty cart state with navigation to events
 * - Checkout button to proceed to payment
 * 
 * Central hub for managing items before purchase
 */

import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

interface CartItemResponse {
  cart_item_id: number;
  item_id: number;
  item_type: "ticket" | "product";
  quantity: number;
  unit_price: number;
  total: number;
}

interface CartResponse {
  cart_id: number;
  items: CartItemResponse[];
  subtotal: number;
}

interface CartItemWithDetails extends CartItemResponse {
  name?: string;
  image?: string;
  ticketType?: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get<CartResponse>("/cart");
      const items = response.data.items || [];

      // Fetch additional details for items (name, image)
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            if (item.item_type === "product") {
              const productResponse = await api.get(`/events/products/${item.item_id}`);
              return {
                ...item,
                name: productResponse.data.name,
                image: productResponse.data.productImage,
              };
            } else if (item.item_type === "ticket") {
              const ticketResponse = await api.get(`/Tickets/${item.item_id}`);
              const eventId = ticketResponse.data.eventId;
              const ticketType = ticketResponse.data.ticketType;

              // Fetch event details to get event name and image
              const eventResponse = await api.get(`/Events/${eventId}`);
              return {
                ...item,
                name: eventResponse.data.title,
                image: eventResponse.data.imageUrl,
                ticketType: ticketType,
              };
            }
            return item;
          } catch (error) {
            console.error(`Error fetching details for ${item.item_type} ${item.item_id}:`, error);
            return item; // Return item without details if fetch fails
          }
        })
      );

      setCartItems(itemsWithDetails);
      setSubtotal(response.data.subtotal || 0);
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your cart.",
          variant: "destructive",
        });
        navigate("/login");
      } else {
        toast({
          title: "Failed to load cart",
          description: error.response?.data?.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(cartItemId);
      await api.put(`/cart/items/${cartItemId}`, { quantity: newQuantity });
      await fetchCart(); // Refresh cart data
      toast({
        title: "Cart updated",
        description: "Quantity updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Failed to update quantity",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      setUpdating(cartItemId);
      await api.delete(`/cart/items/${cartItemId}`);
      await fetchCart(); // Refresh cart data
      toast({
        title: "Item removed",
        description: "Item removed from cart.",
      });
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast({
        title: "Failed to remove item",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(-1); // Use -1 to indicate checkout is processing

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
      toast({
        title: "Checkout failed",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // No service fees - total equals subtotal
  const total = subtotal;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Start adding some events and products!</p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/store">Browse Store</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Shopping Cart
          </span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => {
              const isUpdating = updating === item.cart_item_id;
              return (
                <Card key={item.cart_item_id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || `${item.item_type} ${item.item_id}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {item.name || `${item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)} #${item.item_id}`}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.item_type === "ticket" && item.ticketType ? item.ticketType : item.item_type}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.cart_item_id)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                              disabled={isUpdating}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {item.total.toFixed(2)} EGP
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.unit_price.toFixed(2)} EGP each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between mb-6">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">{total.toFixed(2)} EGP</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || updating === -1}
                >
                  {updating === -1 ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Future Improvements:
 * - Add saved for later functionality
 * - Implement cart persistence (save cart items to database)
 * - Add discount code/coupon input
 * - Include estimated delivery time for products
 * - Add similar item recommendations
 * - Implement bulk actions (select multiple items)
 * - Add gift wrapping options for products
 * - Include stock availability warnings
 * - Add cart sharing functionality
 */
