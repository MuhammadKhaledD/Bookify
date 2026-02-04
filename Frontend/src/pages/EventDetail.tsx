/**
 * EventDetail.tsx
 * 
 * Displays detailed information about a specific event including:
 * - Hero image and event information
 * - Date, time, location, and attendee count  
 * - Multiple ticket types with availability
 * - Save and share functionality
 */

import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Building2, Clock, ShoppingCart, Loader2, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { canAddToCart, canManageEvents, canManageProducts, canDeleteContent } from "@/utils/roles";
import api, { reviewApi, Review } from "@/lib/api";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { isUser } from "@/utils/roles";

// All data fetching is done via API - no local data files needed

type EventDetailType = {
  id: number;
  title: string;
  imageUrl: string;
  eventDate: string;
  locationName: string;
  locationAddress?: string;
  categoryName?: string;
  organizationName?: string;
  description?: string;
  status?: string;
  capacity?: number;
  ageRestriction?: number;
  minPrice?: number | null;
};

type Ticket = {
  id: number;
  eventId: number;
  ticketType: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  limitPerUser?: number;
};

type Product = {
  id: number;
  shopId: number;
  storeId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  quantitySold: number;
  limitPerUser: number;
  discount: number;
  pointsEarnedPerUnit: number;
  productImage: string;
};

type Shop = {
  id: number;
  eventId: number;
  name: string;
  description: string;
  status: boolean;
  shopLogo?: string | null;
  products?: Product[];
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id || "1");
  const { roles } = useAppSelector((state) => state.auth);

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [addingToCart, setAddingToCart] = useState(false);

  // Role-based permissions
  const canAddToCartEvent = canAddToCart(roles);
  const canManageEvent = canManageEvents(roles);
  const canManageShopProducts = canManageProducts(roles);
  const canDeleteEvent = canDeleteContent(roles);
  const { user } = useAppSelector((state) => state.auth);
  const userRoles = (user as any)?.roles || [];
  const canReview = isUser(userRoles);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [eventRes, ticketsRes, shopRes, reviewsRes] = await Promise.all([
          api.get<EventDetailType>(`/Events/${eventId}`),
          api.get<Ticket[]>(`/Tickets/event/${eventId}`),
          api.get<Shop>(`/shops/event/${eventId}`).catch(() => null),
          reviewApi.getEventReviews(eventId).catch(() => ({ reviews: [] })),
        ]);

        setEvent(eventRes.data);
        setTickets(ticketsRes.data);
        if (ticketsRes.data.length > 0) {
          setSelectedTicket(ticketsRes.data[0]);
        }

        const shopData = shopRes && "data" in shopRes ? shopRes.data : null;
        setShop(shopData);
        if (shopData?.products?.length) {
          setShopProducts(shopData.products);
        }

        // Set reviews
        if (reviewsRes && reviewsRes.reviews) {
          setReviews(reviewsRes.reviews);
        }
      } catch (err) {
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  // Function to refresh reviews
  const refreshReviews = async () => {
    try {
      const reviewsRes = await reviewApi.getEventReviews(eventId);
      if (reviewsRes && reviewsRes.reviews) {
        setReviews(reviewsRes.reviews);
      }
      setShowReviewForm(false);
    } catch (err) {
      console.error("Failed to refresh reviews:", err);
    }
  };

  useEffect(() => {
    if (!selectedTicket) return;
    const maxAllowed = getMaxSelectableTickets(selectedTicket);
    setTicketQuantity((prev) => {
      if (maxAllowed <= 0) return 0;
      return Math.min(Math.max(1, prev), maxAllowed);
    });
  }, [selectedTicket]);

  if (!event) {
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    if (error) {
      return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
    }
    return <div className="min-h-screen flex items-center justify-center">Event not found.</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} EGP`;
  };

  const getAvailableTickets = (ticket: Ticket) => {
    return ticket.quantityAvailable - ticket.quantitySold;
  };

  const getMaxSelectableTickets = (ticket: Ticket) => {
    const available = getAvailableTickets(ticket);
    const perUserLimit = ticket.limitPerUser ?? available;
    return Math.max(0, Math.min(available, perUserLimit));
  };

  const getStatusBadge = (status: string) => {
    const statusLower = (status || "active").toLowerCase();
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-primary text-primary-foreground" },
      "sold out": { label: "Sold Out", className: "bg-destructive text-destructive-foreground" },
      cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
    };
    const config = statusConfig[statusLower] || statusConfig["active"];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleAddToCart = async () => {
    if (!selectedTicket) return;

    const maxAllowed = getMaxSelectableTickets(selectedTicket);
    if (maxAllowed <= 0) {
      toast({
        title: "Sold out",
        description: "This ticket type is currently unavailable.",
        variant: "destructive",
      });
      return;
    }

    // Validate quantity
    const available = getAvailableTickets(selectedTicket);
    if (ticketQuantity > available) {
      toast({
        title: "Insufficient tickets",
        description: `Only ${available} tickets available.`,
        variant: "destructive",
      });
      return;
    }

    if (selectedTicket.limitPerUser && ticketQuantity > selectedTicket.limitPerUser) {
      toast({
        title: "Limit exceeded",
        description: `Maximum ${selectedTicket.limitPerUser} tickets per user.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingToCart(true);

      // Prepare request body matching backend AddCartItemRequest format
      // Backend expects: { item_id: int, item_type: string, quantity: int, unit_price: decimal }
      const requestData = {
        item_id: selectedTicket.id,
        item_type: "ticket",
        quantity: ticketQuantity,
        unit_price: Number(selectedTicket.price), // Ensure it's a number, not string
      };

      console.log("🚀 Adding ticket to cart...");
      console.log("Request URL:", `${api.defaults.baseURL}/cart/items`);
      console.log("Request body:", JSON.stringify(requestData, null, 2));

      // POST /api/cart/items with Authorization header (handled by interceptor)
      const response = await api.post("/cart/items", requestData);

      console.log("✅ Response received:", response.data);

      // Backend returns: { cart_item_id, item_id, item_type, quantity, unit_price }
      if (response.status === 200 && response.data) {
        toast({
          title: "Added to cart!",
          description: `${ticketQuantity}x ${selectedTicket.ticketType} ticket(s) added to your cart.`,
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error("❌ Error adding ticket to cart:", error);

      if (error.response?.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to add items to cart.",
          variant: "destructive",
        });
      } else {
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to add ticket to cart. Please try again.";
        toast({
          title: "Failed to add to cart",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image Section */}
      <section className="relative h-96 bg-muted">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </section>

      {/* Event Details */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-primary text-primary-foreground">{event.categoryName}</Badge>
                {getStatusBadge(event.status)}
              </div>

              <div>
                <h1 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {event.title}
                  </span>
                </h1>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Date</div>
                    <div className="text-muted-foreground">{formatDate(event.eventDate)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Time</div>
                    <div className="text-muted-foreground">{formatTime(event.eventDate)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Location</div>
                    <div className="text-muted-foreground">{event.locationName}</div>
                    <div className="text-xs text-muted-foreground">{event.locationAddress}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Organizer</div>
                    <div className="text-muted-foreground">{event.organizationName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Capacity</div>
                    <div className="text-muted-foreground">{event.capacity} attendees</div>
                  </div>
                </div>

                {event.ageRestriction && event.ageRestriction > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">Age Restriction</div>
                      <div className="text-muted-foreground">{event.ageRestriction}+ only</div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    About This Event
                  </span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>
            </Card>

            {shop && shopProducts.length > 0 && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  {shop.shopLogo && (
                    <img src={shop.shopLogo} alt={shop.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold">{shop.name}</h2>
                    <p className="text-sm text-muted-foreground">{shop.description}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {shopProducts.map((product) => (
                    <div key={product.id} className="relative group">
                      <Link
                        to={`/product/${product.id}`}
                        className="block"
                      >
                        <Card className="p-3 space-y-2 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                          <div className="aspect-square bg-muted rounded-md overflow-hidden relative">
                            <img
                              src={product.productImage}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <p className="text-xs font-medium">View Details →</p>
                            </div>
                          </div>
                          <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h4>
                          <p className="text-primary font-bold">{product.price.toFixed(2)} EGP</p>
                          <p className="text-xs text-muted-foreground">
                            {product.stockQuantity > 0 ? "In stock" : "Out of stock"}
                          </p>
                        </Card>
                      </Link>
                      {canManageShopProducts && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingProduct(product);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Product Edit Dialog */}
                <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                      <DialogDescription>
                        Make changes to {editingProduct?.name}. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="prod-name" className="text-right text-sm font-medium">
                          Name
                        </label>
                        <Input
                          id="prod-name"
                          defaultValue={editingProduct?.name}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="prod-price" className="text-right text-sm font-medium">
                          Price
                        </label>
                        <Input
                          id="prod-price"
                          defaultValue={editingProduct?.price}
                          type="number"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="prod-stock" className="text-right text-sm font-medium">
                          Stock
                        </label>
                        <Input
                          id="prod-stock"
                          defaultValue={editingProduct?.stockQuantity}
                          type="number"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={() => {
                        toast({ title: "Product Updated", description: "Changes saved successfully." });
                        setEditingProduct(null);
                      }}>
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Reviews
                  </span>
                </h2>
              </div>

              <Separator />

              {/* Review Form - Only for authenticated users with User role */}
              {canReview && (
                <div className="space-y-4">
                  {!showReviewForm ? (
                    <Button onClick={() => setShowReviewForm(true)} className="w-full sm:w-auto">
                      Write a Review
                    </Button>
                  ) : (
                    <ReviewForm
                      eventId={eventId}
                      onSuccess={refreshReviews}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  )}
                  <Separator />
                </div>
              )}

              {/* Reviews List - Visible to everyone */}
              <ReviewList reviews={reviews} onReviewsChange={refreshReviews} />
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Select Ticket Type</h3>

                <div className="space-y-3 mb-6">
                  {tickets.map((ticket) => {
                    const available = getAvailableTickets(ticket);
                    const isSoldOut = available <= 0;

                    return (
                      <button
                        key={ticket.id}
                        onClick={() => !isSoldOut && setSelectedTicket(ticket)}
                        disabled={isSoldOut}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedTicket?.id === ticket.id
                          ? "border-primary bg-primary/5"
                          : isSoldOut
                            ? "border-border bg-muted opacity-50 cursor-not-allowed"
                            : "border-border hover:border-primary/50"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{ticket.ticketType}</div>
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(ticket.price)}
                            </div>
                          </div>
                          {selectedTicket?.id === ticket.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isSoldOut ? (
                            <span className="text-destructive font-medium">Sold Out</span>
                          ) : (
                            <span>{available} tickets available</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedTicket && getAvailableTickets(selectedTicket) > 0 && (
                  <>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Number of Tickets
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Max {getMaxSelectableTickets(selectedTicket)} per purchase
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          className="h-9 w-9 border rounded-md flex items-center justify-center"
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          disabled={ticketQuantity <= 1 || getMaxSelectableTickets(selectedTicket) <= 0}
                        >
                          -
                        </button>
                        <span className="text-xl font-semibold w-12 text-center">{ticketQuantity}</span>
                        <button
                          className="h-9 w-9 border rounded-md flex items-center justify-center"
                          onClick={() =>
                            setTicketQuantity((prev) =>
                              Math.min(getMaxSelectableTickets(selectedTicket), prev + 1)
                            )
                          }
                          disabled={
                            ticketQuantity >= getMaxSelectableTickets(selectedTicket) ||
                            getMaxSelectableTickets(selectedTicket) <= 0
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 my-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatPrice(selectedTicket.price * ticketQuantity)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(selectedTicket.price * ticketQuantity)}</span>
                      </div>
                    </div>

                    {canAddToCartEvent ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                      >
                        {addingToCart ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    ) : canManageEvent ? (
                      <div className="space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full" size="lg" variant="default">
                              <Edit className="h-5 w-5 mr-2" />
                              Edit Event
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Event</DialogTitle>
                              <DialogDescription>
                                Make changes to event details here. Click save when you're done.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="title" className="text-right text-sm font-medium">
                                  Title
                                </label>
                                <Input
                                  id="title"
                                  defaultValue={event.title}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="date" className="text-right text-sm font-medium">
                                  Date
                                </label>
                                <Input
                                  id="date"
                                  defaultValue={event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : ''}
                                  type="date"
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="location" className="text-right text-sm font-medium">
                                  Location
                                </label>
                                <Input
                                  id="location"
                                  defaultValue={event.locationName}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={() => toast({ title: "Event Updated", description: "Changes saved successfully." })}>
                                Save changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {canDeleteEvent && (
                          <Button
                            className="w-full"
                            size="lg"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this event?")) {
                                toast({
                                  title: "Event Deleted",
                                  description: "The event has been permanently removed.",
                                });
                                // Navigate back to events list
                              }
                            }}
                          >
                            <Trash2 className="h-5 w-5 mr-2" />
                            Delete Event
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <p>You need to be a user to purchase tickets.</p>
                        <Button variant="outline" className="mt-2" asChild>
                          <Link to="/login">Log In</Link>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
