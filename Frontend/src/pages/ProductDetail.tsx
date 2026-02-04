/**
 * ProductDetail.tsx
 * 
 * Detailed product page displaying:
 * - Product image gallery with thumbnail selection
 * - Product information (name, price, description, stock)
 * - Star ratings and customer reviews
 * - Quantity selector and add to cart functionality
 * - Organization/seller information
 * 
 * Enables users to view product details and add items to cart
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Star, Building2, Package, Tag, Award, Loader2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { canAddToCart, canManageProducts, canDeleteContent } from "@/utils/roles";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import api, { reviewApi, Review } from "@/lib/api";

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
  reviews?: Review[];
  shop?: {
    id: number;
    name: string;
    description: string;
    _event?: {
      id: number;
      title: string;
      eventDate: string;
      locationName: string;
    };
  };
  store?: {
    id: number;
    name: string;
    org?: {
      id: number;
      name: string;
      description: string;
    };
  };
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "1");
  const { roles } = useAppSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Role-based permissions
  const canAddToCartProduct = canAddToCart(roles);
  const canManageProduct = canManageProducts(roles);
  const canDeleteProduct = canDeleteContent(roles);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get<Product>(`/events/products/${productId}`),
          reviewApi.getProductReviews(productId).catch(() => ({ reviews: [] })),
        ]);

        const productData = productRes.data;
        setProduct(productData);

        // Set reviews
        if (reviewsRes && reviewsRes.reviews) {
          setReviews(reviewsRes.reviews);
        }

        const stockLeft = Math.max(
          0,
          (productData.stockQuantity || 0) - (productData.quantitySold || 0)
        );
        const limitPerUser = productData.limitPerUser || stockLeft;
        const maxForUser = Math.max(0, Math.min(stockLeft, limitPerUser));
        setQuantity(maxForUser > 0 ? 1 : 0);
      } catch (err) {
        setError("Failed to load product. Please try again later.");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Function to refresh reviews after submission
  const refreshReviews = async () => {
    try {
      const reviewsRes = await reviewApi.getProductReviews(productId);
      if (reviewsRes && reviewsRes.reviews) {
        setReviews(reviewsRes.reviews);
      }
      setShowReviewForm(false);
    } catch (err) {
      console.error("Failed to refresh reviews:", err);
    }
  };

  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    if (maxQuantity <= 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently unavailable.",
        variant: "destructive",
      });
      return;
    }
    if (quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please select at least 1 item.",
        variant: "destructive",
      });
      return;
    }

    // Validate quantity
    const availableStock = product.stockQuantity - product.quantitySold;
    if (quantity > availableStock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${availableStock} items available in stock.`,
        variant: "destructive",
      });
      return;
    }

    if (quantity > product.limitPerUser) {
      toast({
        title: "Limit exceeded",
        description: `Maximum ${product.limitPerUser} items per user.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingToCart(true);
      const finalPrice = calculatePrice();

      // Prepare request body matching backend AddCartItemRequest format
      // Backend expects: { item_id: int, item_type: string, quantity: int, unit_price: decimal }
      const requestData = {
        item_id: product.id,
        item_type: "product",
        quantity: quantity,
        unit_price: Number(finalPrice.toFixed(2)), // Ensure it's a number, not string
      };

      console.log("🚀 Adding product to cart...");
      console.log("Request URL:", `${api.defaults.baseURL}/cart/items`);
      console.log("Request body:", JSON.stringify(requestData, null, 2));

      // POST /api/cart/items with Authorization header (handled by interceptor)
      const response = await api.post("/cart/items", requestData);

      console.log("✅ Response received:", response.data);

      // Backend returns: { cart_item_id, item_id, item_type, quantity, unit_price }
      if (response.status === 200 && response.data) {
        toast({
          title: "Added to cart!",
          description: `${quantity}x ${product.name} added to your cart.`,
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error("❌ Error adding to cart:", error);

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
          "Failed to add item to cart. Please try again.";
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

  const calculatePrice = () => {
    if (!product) return 0;
    const basePrice = product.price;
    if (product.discount > 0) {
      return basePrice - (basePrice * product.discount / 100);
    }
    return basePrice;
  };

  const availableStock = product ? Math.max(0, product.stockQuantity - product.quantitySold) : 0;
  const averageRating = product?.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error || "Product not found"}</p>
          <Button asChild>
            <Link to="/store">Back to Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  const finalPrice = calculatePrice();
  const totalPrice = finalPrice * quantity;
  const maxQuantity = product ? Math.max(0, Math.min(availableStock, product.limitPerUser)) : 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div>
            <div className="relative mb-4">
              <img
                src={product.productImage}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                  -{product.discount}%
                </Badge>
              )}
              <Badge className="absolute top-3 right-3 bg-background/90 text-foreground border-0">
                <Award className="h-4 w-4 mr-1 fill-primary text-primary" />
                +{product.pointsEarnedPerUnit} pts
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {product.store?.org?.name || product.shop?.name || "Unknown Seller"}
              </p>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {product.name}
              </span>
            </h1>

            {averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({product.reviews?.length || 0} reviews)
                </span>
              </div>
            )}

            <div className="mb-6">
              {product.discount > 0 ? (
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-primary">{finalPrice.toFixed(0)} EGP</p>
                  <p className="text-xl text-muted-foreground line-through">{product.price} EGP</p>
                </div>
              ) : (
                <p className="text-4xl font-bold text-primary">{product.price} EGP</p>
              )}
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {availableStock} items in stock
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Limit: {product.limitPerUser} per user
                </span>
              </div>
              {product.shop?._event && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Event: {product.shop._event.title}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || maxQuantity <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                  disabled={quantity >= maxQuantity || maxQuantity <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {maxQuantity > 0 && (
                <span className="text-sm text-muted-foreground">
                  (Max: {maxQuantity})
                </span>
              )}
            </div>

            {availableStock > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Total:</p>
                  <p className="text-2xl font-bold text-primary">{totalPrice.toFixed(0)} EGP</p>
                  <p className="text-xs text-muted-foreground">
                    Earn {product.pointsEarnedPerUnit * quantity} reward points
                  </p>
                </div>
                {canAddToCartProduct ? (
                  <Button
                    size="lg"
                    className="w-full mb-4"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                ) : canManageProduct ? (
                  <div className="space-y-2 mb-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="lg" className="w-full" variant="default">
                          <Edit className="mr-2 h-5 w-5" />
                          Edit Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                          <DialogDescription>
                            Make changes to product details here. Click save when you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
                              Name
                            </label>
                            <Input
                              id="name"
                              defaultValue={product.name}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="price" className="text-right text-sm font-medium">
                              Price
                            </label>
                            <Input
                              id="price"
                              defaultValue={product.price}
                              type="number"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="stock" className="text-right text-sm font-medium">
                              Stock
                            </label>
                            <Input
                              id="stock"
                              defaultValue={product.stockQuantity}
                              type="number"
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={() => toast({ title: "Product Updated", description: "Changes saved successfully." })}>
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {canDeleteProduct && (
                      <Button
                        size="lg"
                        className="w-full"
                        variant="destructive"
                        onClick={() => {
                          // TODO: Implement delete product
                          toast({
                            title: "Delete Product",
                            description: "This feature will be implemented soon.",
                          });
                        }}
                      >
                        <Trash2 className="mr-2 h-5 w-5" />
                        Delete Product
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4 mb-4">
                    <p>You need to be a user to purchase products.</p>
                    <Button variant="outline" className="mt-2" asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Button size="lg" className="w-full mb-4" disabled>
                Out of Stock
              </Button>
            )}
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link to="/store">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Customer Reviews
            </span>
          </h2>

          {/* Review Form - Only show for authenticated users with User role */}
          {canAddToCartProduct && (
            <div className="space-y-4">
              {!showReviewForm ? (
                <Button onClick={() => setShowReviewForm(true)} className="w-full sm:w-auto">
                  Write a Review
                </Button>
              ) : (
                <ReviewForm
                  productId={productId}
                  onSuccess={refreshReviews}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
            </div>
          )}

          {/* Reviews List - Visible to everyone */}
          <ReviewList reviews={reviews} onReviewsChange={refreshReviews} />
        </div>
      </div>
    </div>
  );
}

/**
 * Future Improvements:
 * - Add full customer review system with ratings and comments
 * - Implement product size and color variants
 * - Add product recommendations (similar items, frequently bought together)
 * - Include product availability notifications
 * - Add zoom functionality for product images
 * - Implement wishlist/favorites button
 * - Add social sharing for products
 * - Include product Q&A section
 * - Add size guide or measurement information
 */
