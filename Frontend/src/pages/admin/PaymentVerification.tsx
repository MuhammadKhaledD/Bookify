/**
 * PaymentVerification.tsx
 * 
 * Admin page for verifying payments:
 * - List all pending payments
 * - View payment details (order, method, reference)
 * - Validate or decline payments
 * - Update order status accordingly
 * 
 * Admin-only functionality for payment verification workflow
 */

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Eye, Loader2, DollarSign, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_reference: string;
  status: "Pending" | "Valid" | "Declined";
  order?: {
    id: number;
    status: string;
    total_amount: number;
    order_date: string;
    items?: Array<{
      item_id: number;
      item_type: string;
      quantity: number;
      unit_price: number;
    }>;
  };
}

export default function PaymentVerification() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchPayments();
  }, [isAuthenticated, navigate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // GET /api/payments - Fetch all payments
      const response = await api.get("/payments");
      const paymentsList: Payment[] = response.data || [];

      // Fetch order details for each payment to show amount
      const paymentsWithOrders = await Promise.all(
        paymentsList.map(async (payment) => {
          try {
            const orderResponse = await api.get(`/orders/${payment.order_id}`);
            return {
              ...payment,
              order: orderResponse.data,
            };
          } catch (err) {
            // If order fetch fails, return payment without order details
            return payment;
          }
        })
      );

      // Sort to show pending payments first
      setPayments(paymentsWithOrders.sort((a, b) => {
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;
        return 0;
      }));
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Failed to load payments",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: number, status: "Valid" | "Declined") => {
    try {
      setProcessing(paymentId);

      // PUT /api/payments/admin/{paymentId}
      // Request body: { "status": "Valid" } or { "status": "Declined" }
      const requestBody = { status };

      console.log("Verifying payment:", {
        paymentId,
        status,
        url: `/payments/admin/${paymentId}`,
        body: requestBody,
      });

      const response = await api.put(`/payments/admin/${paymentId}`, requestBody);

      console.log("Payment verification response:", response.data);

      toast({
        title: status === "Valid" ? "Payment validated" : "Payment declined",
        description: `Payment has been ${status === "Valid" ? "validated" : "declined"} successfully.`,
      });

      // Refresh payments list
      await fetchPayments();
      setIsDialogOpen(false);
      setSelectedPayment(null);
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to verify payment. Please try again.";

      toast({
        title: "Failed to verify payment",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const openPaymentDetails = async (payment: Payment) => {
    try {
      // Fetch full order details if not already loaded
      if (!payment.order) {
        const orderResponse = await api.get(`/orders/${payment.order_id}`);
        setSelectedPayment({
          ...payment,
          order: orderResponse.data,
        });
      } else {
        setSelectedPayment(payment);
      }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "Valid":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Valid</Badge>;
      case "Declined":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === "Pending");
  const otherPayments = payments.filter(p => p.status !== "Pending");

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Payment Verification
            </span>
          </h1>
          <Button
            variant="outline"
            onClick={() => fetchPayments()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Pending Verification ({pendingPayments.length})</h2>
            <div className="grid gap-4">
              {pendingPayments.map((payment) => (
                <Card key={payment.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">Payment #{payment.id}</h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Order ID:</span> <span className="ml-1">#{payment.order_id}</span>
                          </div>
                          <div>
                            <span className="font-medium">Method:</span> <span className="ml-1 capitalize">{payment.payment_method}</span>
                          </div>
                          <div>
                            <span className="font-medium">Reference:</span> <span className="ml-1">{payment.payment_reference || "N/A"}</span>
                          </div>
                          {payment.order ? (
                            <div>
                              <span className="font-medium">Amount:</span> <span className="ml-1 font-semibold text-primary">{payment.order.total_amount.toFixed(2)} EGP</span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium">Amount:</span> <span className="ml-1 text-muted-foreground">Loading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentDetails(payment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerifyPayment(payment.id, "Valid")}
                          disabled={processing === payment.id}
                        >
                          {processing === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Validate
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerifyPayment(payment.id, "Declined")}
                          disabled={processing === payment.id}
                        >
                          {processing === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Payments */}
        {otherPayments.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">All Payments</h2>
            <div className="grid gap-4">
              {otherPayments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">Payment #{payment.id}</h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Order ID:</span> <span className="ml-1">#{payment.order_id}</span>
                          </div>
                          <div>
                            <span className="font-medium">Method:</span> <span className="ml-1 capitalize">{payment.payment_method}</span>
                          </div>
                          <div>
                            <span className="font-medium">Reference:</span> <span className="ml-1">{payment.payment_reference || "N/A"}</span>
                          </div>
                          {payment.order ? (
                            <div>
                              <span className="font-medium">Amount:</span> <span className="ml-1 font-semibold text-primary">{payment.order.total_amount.toFixed(2)} EGP</span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium">Amount:</span> <span className="ml-1 text-muted-foreground">Loading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPaymentDetails(payment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {payments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">There are no payments to verify at this time.</p>
            </CardContent>
          </Card>
        )}

        {/* Payment Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Review payment information and order details before verification
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6">
                {/* Payment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <span className="font-medium">#{selectedPayment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedPayment.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{selectedPayment.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-medium">{selectedPayment.payment_reference || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Info */}
                {selectedPayment.order && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">Order ID:</span>
                          <span className="font-medium ml-2">#{selectedPayment.order.id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className="ml-2">{selectedPayment.order.status}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium ml-2">{selectedPayment.order.total_amount.toFixed(2)} EGP</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Order Date:</span>
                          <span className="font-medium ml-2">
                            {new Date(selectedPayment.order.order_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      {selectedPayment.order.items && selectedPayment.order.items.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Order Items:</h4>
                          <div className="space-y-2">
                            {selectedPayment.order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between p-2 bg-muted rounded">
                                <div>
                                  <span className="font-medium capitalize">{item.item_type} #{item.item_id}</span>
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
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                {selectedPayment.status === "Pending" && (
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleVerifyPayment(selectedPayment.id, "Declined")}
                      disabled={processing === selectedPayment.id}
                    >
                      {processing === selectedPayment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Decline Payment
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyPayment(selectedPayment.id, "Valid")}
                      disabled={processing === selectedPayment.id}
                    >
                      {processing === selectedPayment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Validate Payment
                    </Button>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
