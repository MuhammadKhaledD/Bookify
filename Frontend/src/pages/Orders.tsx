/**
 * Orders.tsx
 * 
 * Order history page displaying:
 * - Complete list of past and current orders
 * - Order status badges (Unpaid, UnderReview, Delivered)
 * - Detailed order information in expandable modal
 * - Payment information and management
 * - Order cancellation functionality
 * - Order summary with total and items purchased
 * 
 * Allows users to track and manage their order history
 */

import { useState, useEffect } from "react";
import { Download, Eye, Calendar, MapPin, Trash2, CreditCard, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface OrderItem {
  item_id: number;
  item_type: "ticket" | "product";
  quantity: number;
  unit_price: number;
  name?: string;
  image?: string;
  ticketType?: string;
}

interface Payment {
  id: number;
  payment_method: string;
  payment_reference: string;
  status: "Pending" | "Valid" | "Declined";
}

interface Order {
  id: number;
  status: "Unpaid" | "UnderReview" | "Delivered";
  total_amount: number;
  order_date: string;
  items?: OrderItem[];
  payment?: Payment;
}

export default function Orders() {
  const navigate = useNavigate();
  const { id: orderIdParam } = useParams<{ id?: string }>();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();

    // If orderIdParam exists, fetch that specific order
    if (orderIdParam) {
      fetchOrderDetails(parseInt(orderIdParam));
    }
  }, [isAuthenticated, navigate, orderIdParam]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // GET /api/orders
      const response = await api.get<Order[]>("/orders");
      const orders = response.data || [];

      // Fetch additional details for order items
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          if (order.items && order.items.length > 0) {
            const itemsWithDetails = await Promise.all(
              order.items.map(async (item) => {
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
                  return item;
                }
              })
            );
            return { ...order, items: itemsWithDetails };
          }
          return order;
        })
      );

      setOrders(ordersWithDetails);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Failed to load orders",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      // GET /api/orders/{orderId}
      const response = await api.get<Order>(`/orders/${orderId}`);
      const order = response.data;

      // Fetch additional details for order items
      if (order.items && order.items.length > 0) {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
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
              return item;
            }
          })
        );
        order.items = itemsWithDetails;
      }

      setSelectedOrder(order);
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Failed to load order details",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setProcessing(orderId);
      // DELETE /api/orders/{orderId}
      await api.delete(`/orders/${orderId}`);

      toast({
        title: "Order cancelled",
        description: "Order has been cancelled successfully.",
      });

      await fetchOrders();
      setIsDialogOpen(false);
      setSelectedOrder(null);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Failed to cancel order",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleAddPayment = async (orderId: number) => {
    try {
      setProcessing(orderId);
      // POST /api/payments
      await api.post("/payments", {
        order_id: orderId,
        method: paymentMethod,
        payment_reference: paymentReference,
      });

      toast({
        title: "Payment added",
        description: "Payment method has been added. Waiting for admin verification.",
      });

      await fetchOrders();
      setIsPaymentDialogOpen(false);
      setPaymentMethod("Cash");
      setPaymentReference("");
    } catch (error: any) {
      console.error("Error adding payment:", error);
      toast({
        title: "Failed to add payment",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleEditPayment = async (paymentId: number) => {
    try {
      setProcessing(paymentId);
      // PUT /api/payments/{paymentId}
      await api.put(`/payments/${paymentId}`, {
        method: paymentMethod,
        payment_reference: paymentReference,
      });

      toast({
        title: "Payment updated",
        description: "Payment information has been updated.",
      });

      await fetchOrders();
      setIsEditPaymentDialogOpen(false);
      setPaymentMethod("Cash");
      setPaymentReference("");
    } catch (error: any) {
      console.error("Error editing payment:", error);
      toast({
        title: "Failed to update payment",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm("Are you sure you want to remove this payment?")) return;

    try {
      setProcessing(paymentId);
      // DELETE /api/payments/{paymentId}
      await api.delete(`/payments/${paymentId}`);

      toast({
        title: "Payment removed",
        description: "Payment has been removed from the order.",
      });

      await fetchOrders();
      setIsDialogOpen(false);
      setSelectedOrder(null);
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Failed to remove payment",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const openPaymentDialog = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMethod("Cash");
    setPaymentReference("");
    setIsPaymentDialogOpen(true);
  };

  const openEditPaymentDialog = (order: Order) => {
    setSelectedOrder(order);
    if (order.payment) {
      setPaymentMethod(order.payment.payment_method);
      setPaymentReference(order.payment.payment_reference);
    }
    setIsEditPaymentDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Unpaid":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Unpaid</Badge>;
      case "UnderReview":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Under Review</Badge>;
      case "Delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const downloadTicket = (orderId: number) => {
    toast({
      title: "Downloading ticket...",
      description: "Your e-ticket with QR code is being downloaded.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Orders
          </span>
        </h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No orders found.</p>
              <Button className="mt-4" onClick={() => navigate("/store")}>
                Browse Store
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="mb-2">Order #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-0">
                          <div>
                            <p className="font-medium capitalize">
                              {item.name || `${item.item_type} #${item.item_id}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.item_type === "ticket" && item.ticketType ? (
                                <>
                                  {item.ticketType} • Quantity: {item.quantity} • {item.unit_price.toFixed(2)} EGP each
                                </>
                              ) : (
                                <>
                                  Quantity: {item.quantity} • {item.unit_price.toFixed(2)} EGP each
                                </>
                              )}
                            </p>
                          </div>
                          <Badge variant="outline">{item.item_type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment Info */}
                  {order.payment && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold mb-1">Payment Information</h4>
                          <p className="text-sm text-muted-foreground">
                            Method: {order.payment.payment_method}
                          </p>
                          {order.payment.payment_reference && (
                            <p className="text-sm text-muted-foreground">
                              Reference: {order.payment.payment_reference}
                            </p>
                          )}
                          <Badge className="mt-2">{order.payment.status}</Badge>
                        </div>
                        {order.status !== "Delivered" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditPaymentDialog(order)}
                            >
                              Edit Payment
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePayment(order.payment!.id)}
                              disabled={processing === order.payment!.id}
                            >
                              {processing === order.payment!.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total and Actions */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">Total: </span>
                      <span className="text-xl font-bold text-primary">
                        {order.total_amount.toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrderDetails(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {order.status === "Unpaid" && !order.payment && (
                        <Button
                          size="sm"
                          onClick={() => openPaymentDialog(order)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Add Payment
                        </Button>
                      )}
                      {order.status !== "Delivered" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={processing === order.id}
                        >
                          {processing === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Cancel
                        </Button>
                      )}
                      {order.items?.some(item => item.item_type === "ticket") && (
                        <Button size="sm" onClick={() => downloadTicket(order.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          E-Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
              <DialogDescription>
                Complete order information and payment status
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-semibold">{selectedOrder.total_amount.toFixed(2)} EGP</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p>{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium capitalize">{item.name || `${item.item_type} #${item.item_id}`}</span>
                            {item.item_type === "ticket" && item.ticketType && (
                              <span className="text-sm text-muted-foreground ml-2">({item.ticketType})</span>
                            )}
                            <span className="text-sm text-muted-foreground ml-2">
                              x{item.quantity} @ {item.unit_price.toFixed(2)} EGP
                            </span>
                          </div>
                          <span className="font-medium">
                            {(item.quantity * item.unit_price).toFixed(2)} EGP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrder.payment && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Payment Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Method:</span> {selectedOrder.payment.payment_method}</p>
                      <p><span className="text-muted-foreground">Reference:</span> {selectedOrder.payment.payment_reference || "N/A"}</p>
                      <p><span className="text-muted-foreground">Status:</span> <Badge>{selectedOrder.payment.status}</Badge></p>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {selectedOrder.status === "Unpaid" && !selectedOrder.payment && (
                    <Button onClick={() => {
                      setIsDialogOpen(false);
                      openPaymentDialog(selectedOrder);
                    }}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment
                    </Button>
                  )}
                  {selectedOrder.status !== "Delivered" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      disabled={processing === selectedOrder.id}
                    >
                      {processing === selectedOrder.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Cancel Order
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add payment information for order #{selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="CreditCard">Credit Card</SelectItem>
                    <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                    <SelectItem value="MobilePayment">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  placeholder="Enter payment reference (optional)"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedOrder && handleAddPayment(selectedOrder.id)}
                disabled={processing === selectedOrder?.id}
              >
                {processing === selectedOrder?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Dialog */}
        <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payment Method</DialogTitle>
              <DialogDescription>
                Update payment information for order #{selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editPaymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="CreditCard">Credit Card</SelectItem>
                    <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                    <SelectItem value="MobilePayment">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPaymentReference">Payment Reference</Label>
                <Input
                  id="editPaymentReference"
                  placeholder="Enter payment reference (optional)"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedOrder?.payment && handleEditPayment(selectedOrder.payment.id)}
                disabled={processing === selectedOrder?.payment?.id}
              >
                {processing === selectedOrder?.payment?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Update Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/**
 * Future Improvements:
 * - Add order filtering (by status, date, type)
 * - Implement order tracking for physical products
 * - Add reorder functionality for past purchases
 * - Include invoice generation and download
 * - Add order cancellation and refund requests
 * - Implement real QR code generation for e-tickets
 * - Add email/print ticket options
 * - Include order dispute/support contact
 * - Add order search functionality
 * - Implement order notifications and reminders
 */
