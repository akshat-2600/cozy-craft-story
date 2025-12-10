import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingBag, Star, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { slug: "all", name: "All Products" },
  { slug: "explosion-boxes", name: "Explosion Boxes" },
  { slug: "greeting-cards", name: "Greeting Cards" },
  { slug: "3d-albums", name: "3D Albums" },
  { slug: "anniversary-albums", name: "Anniversary Albums" },
  { slug: "birthday-cards", name: "Birthday Cards" },
  { slug: "pyramid-albums", name: "Pyramid Albums" },
  { slug: "mini-albums", name: "Mini Albums" },
];

const allProducts = [
  { id: 1, name: "Love Story Explosion Box", price: 2499, originalPrice: 2999, rating: 4.9, reviews: 124, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop", category: "explosion-boxes", isNew: true, isBestseller: false },
  { id: 2, name: "Floral Birthday Greeting Card", price: 399, originalPrice: null, rating: 4.8, reviews: 89, image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=500&h=500&fit=crop", category: "greeting-cards", isNew: false, isBestseller: true },
  { id: 3, name: "Wedding Anniversary Album", price: 3999, originalPrice: 4999, rating: 5.0, reviews: 67, image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500&h=500&fit=crop", category: "anniversary-albums", isNew: false, isBestseller: true },
  { id: 4, name: "Pop-up 3D Memory Album", price: 2999, originalPrice: 3499, rating: 4.7, reviews: 156, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop", category: "3d-albums", isNew: true, isBestseller: false },
  { id: 5, name: "Pyramid Photo Album", price: 1899, originalPrice: null, rating: 4.6, reviews: 43, image: "https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=500&h=500&fit=crop", category: "pyramid-albums", isNew: false, isBestseller: false },
  { id: 6, name: "Birthday Surprise Box", price: 1999, originalPrice: 2499, rating: 4.9, reviews: 98, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&h=500&fit=crop", category: "birthday-cards", isNew: true, isBestseller: true },
  { id: 7, name: "Compact Memory Mini Album", price: 999, originalPrice: null, rating: 4.5, reviews: 72, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop", category: "mini-albums", isNew: false, isBestseller: false },
  { id: 8, name: "Thank You Card Set", price: 799, originalPrice: 999, rating: 4.8, reviews: 134, image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=500&h=500&fit=crop", category: "greeting-cards", isNew: false, isBestseller: true },
  { id: 9, name: "Romantic Explosion Box", price: 2799, originalPrice: null, rating: 4.9, reviews: 87, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop", category: "explosion-boxes", isNew: false, isBestseller: true },
  { id: 10, name: "Baby Shower Card", price: 449, originalPrice: null, rating: 4.7, reviews: 56, image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=500&h=500&fit=crop", category: "greeting-cards", isNew: true, isBestseller: false },
  { id: 11, name: "Golden Anniversary Album", price: 4499, originalPrice: 5499, rating: 5.0, reviews: 34, image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500&h=500&fit=crop", category: "anniversary-albums", isNew: false, isBestseller: false },
  { id: 12, name: "Travel Mini Album", price: 1299, originalPrice: null, rating: 4.6, reviews: 91, image: "https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=500&h=500&fit=crop", category: "mini-albums", isNew: true, isBestseller: false },
];

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const activeCategory = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sort") || "featured";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").eq("in_stock", true);
    if (data) setProducts(data);
  };

  const filteredProducts = products
    .filter((product) => {
      if (activeCategory !== "all" && product.category !== activeCategory) return false;
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return (b.rating || 0) - (a.rating || 0);
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0;
      }
    });

  const handleToggleWishlist = (product: any) => {
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop",
      category: product.category,
      rating: product.rating,
    });
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border bg-gradient-hero py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Shop All Products
            </h1>
            <p className="max-w-2xl font-body text-lg text-muted-foreground">
              Explore our collection of handcrafted creations, each made with love and attention to detail.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSearchParams({ category: cat.slug })}
                        className={cn(
                          "block w-full rounded-lg px-3 py-2 text-left font-body text-sm transition-colors",
                          activeCategory === cat.slug
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                  <Select value={sortBy} onValueChange={(value) => setSearchParams({ category: activeCategory, sort: value })}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="mb-6 rounded-xl bg-card p-4 lg:hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm font-semibold">Categories</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => { setSearchParams({ category: cat.slug }); setShowFilters(false); }}
                        className={cn(
                          "rounded-full px-4 py-2 font-body text-sm transition-colors",
                          activeCategory === cat.slug
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <p className="mb-6 font-body text-sm text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>

              {/* Products Grid */}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative rounded-2xl bg-card overflow-hidden shadow-soft transition-all duration-500 hover:shadow-hover animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative aspect-square image-zoom">
                      <img src={product.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop"} alt={product.name} className="h-full w-full object-cover" />
                      <div className="absolute left-3 top-3 flex flex-col gap-2">
                        {product.badge && <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{product.badge}</span>}
                        {product.featured && <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Featured</span>}
                        {product.original_price && <span className="rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">Sale</span>}
                      </div>
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-soft transition-all hover:bg-card hover:scale-110"
                      >
                        <Heart className={cn("h-4 w-4 transition-colors", isInWishlist(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <Button className="w-full" size="sm" onClick={() => handleAddToCart(product)}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="mb-1 block font-body text-xs text-muted-foreground capitalize">
                        {product.category.replace("-", " ")}
                      </span>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="mb-2 font-display text-base font-semibold text-foreground transition-colors hover:text-primary line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      {product.rating && (
                        <div className="mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-body text-sm font-medium text-foreground">{product.rating}</span>
                          {product.review_count && <span className="font-body text-xs text-muted-foreground">({product.review_count})</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
                        {product.original_price && <span className="font-body text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="font-body text-lg text-muted-foreground">No products found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
