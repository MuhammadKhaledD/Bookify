/**
 * Store.tsx
 *
 * Store page displaying products:
 * - Search functionality for finding products by name
 * - Shop filtering
 * - Pagination (6 products per page)
 * - Responsive grid layout for product cards
 */

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import api from "@/lib/api";

const PAGE_SIZE = 6;

type Product = {
  id: number;
  shopId: number;
  storeId?: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  stockQuantity: number;
  limitPerUser: number;
  pointsEarnedPerUnit: number;
  productImage: string;
};

type Organization = {
  id: number;
  name: string;
};

type Store = {
  id: number;
  orgId: number;
  name: string;
  description: string;
  status: boolean;
  storeLogo?: string;
  org?: Organization;
  products?: Product[];
};

const Store = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [storesMap, setStoresMap] = useState<Map<number, Store>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const organizationsRes = await api.get<Organization[]>(
          "/organizations"
        );
        setOrganizations(organizationsRes.data || []);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };
    fetchOrganizations();
  }, []);

  // Fetch products based on selected organization
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        if (selectedOrg === "all") {
          // Fetch all products
          const productsRes = await api.get<Product[]>("/events/products");
          setProducts(productsRes.data || []);
        } else {
          // Fetch products from specific organization's store
          const orgId = Number(selectedOrg);
          const storeRes = await api.get<Store>(`/stores/${orgId}`);
          const storeData = storeRes.data;

          // Store the store data in map for later use
          if (storeData) {
            setStoresMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(storeData.id, storeData);
              return newMap;
            });
          }

          setProducts(storeData?.products || []);
        }
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedOrg]);

  // Filter products based on search (organization filtering is done by backend)
  const filteredProducts = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchLower ||
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [products, searchQuery]);

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // Calculate pagination metadata
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOrg]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const getOrganizationName = (storeId?: number) => {
    if (!storeId) {
      // If no storeId, try to get from selectedOrg
      if (selectedOrg !== "all") {
        const org = organizations.find((o) => o.id === Number(selectedOrg));
        return org?.name || "Unknown Organization";
      }
      return "Unknown Organization";
    }

    // Get organization from store
    const store = storesMap.get(storeId);
    if (store?.org?.name) {
      return store.org.name;
    }

    // Fallback: find organization by store's orgId
    if (store?.orgId) {
      const org = organizations.find((o) => o.id === store.orgId);
      return org?.name || "Unknown Organization";
    }

    return "Unknown Organization";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Merchandise Store
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Shop exclusive merchandise from your favorite events
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-16 z-40 bg-background border-b border-border py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Organization Filter */}
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-full md:w-64">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Loading products...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg">{error}</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing {paginatedProducts.length} of{" "}
                  {filteredProducts.length} products
                </p>
              </div>

              {/* Products Grid */}
              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      discount={product.discount}
                      image={product.productImage}
                      organizationName={getOrganizationName(product.storeId)}
                      stockQuantity={product.stockQuantity}
                      limitPerUser={product.limitPerUser}
                      pointsEarned={product.pointsEarnedPerUnit}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No products found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedOrg("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Store;
