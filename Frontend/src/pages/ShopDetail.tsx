/**
 * ShopDetail.tsx
 * 
 * Individual shop page displaying all products from a specific shop:
 * - Shop header with name and organization
 * - Product grid with images, pricing, and stock info
 * - Search and filter functionality for products
 * - Links to individual product detail pages
 * 
 * Shows all merchandise available from a particular event organization's shop
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, Store as StoreIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { organizationApi, productsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Organization {
  id: number;
  name: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  productImage?: string;
  orgName: string;
}

export default function ShopDetail() {
  const { id } = useParams();
  const orgId = parseInt(id || "1");

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch organization details
        const orgData = await organizationApi.getById(orgId);
        setOrganization(orgData);

        // Fetch all products and filter by organization
        const productsData = await productsApi.getAll();
        const orgProducts = productsData.filter((p: Product) => p.orgName === orgData.name);
        setProducts(orgProducts);
      } catch (error) {
        console.error("Failed to fetch store data:", error);
        toast({
          title: "Error",
          description: "Failed to load store details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
          <Button asChild>
            <Link to="/store">Back to Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shop Header */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/store">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>

          <div className="flex items-start gap-4 mb-6">
            <StoreIcon className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {organization.name} Store
                </span>
              </h1>
              {organization.description && (
                <p className="text-lg text-muted-foreground">{organization.description}</p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Available Products
              </span>
            </h2>
            <p className="text-muted-foreground mt-1">{filteredProducts.length} items found</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <img
                    src={product.productImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">EGP {product.price}</span>
                    <span className="text-sm text-muted-foreground">{product.stockQuantity} in stock</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link to={`/product/${product.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * Future Improvements:
 * - Add product category filtering
 * - Implement sorting (price, popularity, newest)
 * - Add product comparison feature
 * - Include shop description and about section
 * - Add customer reviews for shop
 * - Implement wishlist for products
 * - Add bulk add to cart functionality
 * - Include related/recommended products
 * - Add shop contact/support information
 * - Implement product availability notifications
 */
