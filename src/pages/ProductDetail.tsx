import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  Gift,
  Package,
  Sparkles,
  Clock,
  Check,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  description: string | null;
  category: string;
  image_url: string | null;
  images: string[] | null;
  rating: number | null;
  review_count: number | null;
  badge: string | null;
  featured: boolean | null;
  in_stock: boolean | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

const occasionsByCategory: Record<string, string[]> = {
  "explosion-boxes": ["Anniversaries", "Weddings", "Valentine's Day", "Proposals"],
  "greeting-cards": ["Birthdays", "Thank You", "Congratulations", "Get Well Soon"],
  "3d-albums": ["Memories", "Travel", "Family", "Milestones"],
  "anniversary-albums": ["Anniversaries", "Weddings", "Couple Milestones"],
  "birthday-cards": ["Birthdays", "Kids Parties", "Milestone Birthdays"],
  "pyramid-albums": ["Photo Collections", "Events", "Memories"],
  "mini-albums": ["Travel", "Daily Memories", "Gifts"],
};

const materialsByCategory: Record<string, string[]> = {
  "explosion-boxes": ["Premium Cardstock", "Decorative Papers", "Ribbons", "Embellishments"],
  "greeting-cards": ["Handmade Paper", "Glitter Accents", "Foil Details"],
  "3d-albums": ["Layered Cardstock", "Pop-up Mechanisms", "Photo Mounts"],
  "anniversary-albums": ["Velvet Cover", "Gold Accents", "Archival Paper"],
  "birthday-cards": ["Colorful Cardstock", "3D Elements", "Stickers"],
  "pyramid-albums": ["Structured Cardboard", "Photo Corners", "Decorative Tape"],
  "mini-albums": ["Compact Binding", "Photo Sleeves", "Corner Mounts"],
};

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  useEffect(() => {
    if (user && productId) {
      checkCanReview();
    }
  }, [user, productId]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error || !data) {
      toast({ title: "Product not found", variant: "destructive" });
      navigate("/shop");
      return;
    }

    setProduct(data);
    fetchRelatedProducts(data.category, data.id);
    setLoading(false);
  };

  const fetchRelatedProducts = async (category: string, excludeId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", excludeId)
      .eq("in_stock", true)
      .limit(4);

    if (data) setRelatedProducts(data);
  };

  const fetchReviews = async () => {
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (reviewsData && reviewsData.length > 0) {
      // Fetch profile names for reviews
      const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const reviewsWithNames = reviewsData.map((review) => ({
        ...review,
        user_name: profiles?.find((p) => p.id === review.user_id)?.full_name || "Anonymous",
      }));

      setReviews(reviewsWithNames);
    }
  };

  const checkCanReview = async () => {
    // Check if user has a delivered order with this product and hasn't reviewed yet
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_items!inner(product_id)")
      .eq("user_id", user?.id)
      .eq("status", "delivered")
      .eq("order_items.product_id", productId);

    if (orders && orders.length > 0) {
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user?.id)
        .eq("product_id", productId)
        .maybeSingle();

      setCanReview(!existingReview);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image_url: product.image_url || "",
    });
  };

  const handleSubmitReview = async () => {
    if (!user || !productId) return;

    setSubmittingReview(true);

    // Get the first delivered order with this product
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_items!inner(product_id)")
      .eq("user_id", user.id)
      .eq("status", "delivered")
      .eq("order_items.product_id", productId)
      .limit(1);

    if (!orders || orders.length === 0) {
      toast({ title: "You can only review products you've purchased", variant: "destructive" });
      setSubmittingReview(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      product_id: productId,
      order_id: orders[0].id,
      rating: newReview.rating,
      comment: newReview.comment || null,
    });

    if (error) {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } else {
      toast({ title: "Review submitted successfully!" });
      setNewReview({ rating: 5, comment: "" });
      setCanReview(false);
      fetchReviews();
    }

    setSubmittingReview(false);
  };

  const allImages = product
    ? [product.image_url, ...(product.images || [])].filter(Boolean) as string[]
    : [];

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product?.rating || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const occasions = occasionsByCategory[product.category] || ["Gifting", "Special Occasions"];
  const materials = materialsByCategory[product.category] || ["Handmade Materials", "Premium Papers"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-secondary/30">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 font-body text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
              <ChevronRight className="h-4 w-4" />
              <Link
                to={`/shop?category=${product.category}`}
                className="hover:text-primary transition-colors capitalize"
              >
                {product.category.replace(/-/g, " ")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div
                className={cn(
                  "relative aspect-square overflow-hidden rounded-2xl bg-secondary cursor-zoom-in group",
                  isZoomed && "cursor-zoom-out"
                )}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={allImages[selectedImageIndex] || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=800&fit=crop"}
                  alt={product.name}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-500",
                    isZoomed && "scale-150"
                  )}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-70 transition-opacity drop-shadow-lg" />
                </div>

                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.badge && (
                    <Badge className="bg-accent text-accent-foreground">{product.badge}</Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                  )}
                  {product.original_price && (
                    <Badge variant="destructive">
                      {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </Badge>
                  )}
                </div>

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-110"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-110"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImageIndex === index
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Name */}
              <div>
                <Link
                  to={`/shop?category=${product.category}`}
                  className="mb-2 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary hover:underline"
                >
                  {product.category.replace(/-/g, " ")}
                </Link>
                <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-5 w-5",
                        star <= Math.round(Number(averageRating))
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="font-body text-sm font-medium text-foreground">{averageRating}</span>
                <span className="font-body text-sm text-muted-foreground">
                  ({reviews.length || product.review_count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <>
                    <span className="font-body text-xl text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      Save {formatPrice(product.original_price - product.price)}
                    </Badge>
                  </>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Description</h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {product.description || `Beautifully handcrafted ${product.name.toLowerCase()} made with love and attention to detail. Each piece is unique and created with premium materials to ensure lasting memories.`}
                </p>
              </div>

              {/* Occasions */}
              <div>
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Perfect For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {occasions.map((occasion) => (
                    <Badge key={occasion} variant="secondary" className="font-body">
                      {occasion}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-body text-sm font-medium text-foreground">Quantity:</span>
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-body font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-10 w-10 items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={cn(isWishlisted && "text-destructive border-destructive")}
                  >
                    <Heart className={cn("h-5 w-5", isWishlisted && "fill-destructive")} />
                  </Button>
                </div>

                {!product.in_stock && (
                  <p className="font-body text-sm text-destructive">Currently out of stock</p>
                )}
              </div>

              <Separator />

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">Free Shipping</p>
                    <p className="font-body text-xs text-muted-foreground">On orders above ₹999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">Secure Payment</p>
                    <p className="font-body text-xs text-muted-foreground">100% Protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">Handmade</p>
                    <p className="font-body text-xs text-muted-foreground">Crafted with love</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">5-7 Days</p>
                    <p className="font-body text-xs text-muted-foreground">Delivery Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="container mx-auto px-4 py-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Details & Materials
              </TabsTrigger>
              <TabsTrigger
                value="delivery"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Delivery Info
              </TabsTrigger>
              <TabsTrigger
                value="care"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Care Instructions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 font-display text-xl font-semibold text-foreground">
                    Handmade with Premium Materials
                  </h3>
                  <ul className="space-y-3">
                    {materials.map((material) => (
                      <li key={material} className="flex items-center gap-3 font-body text-muted-foreground">
                        <Check className="h-5 w-5 text-primary" />
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-4 font-display text-xl font-semibold text-foreground">
                    Customization Available
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    Want to personalize this product? Contact us for custom messages, photos, or color preferences. 
                    We're happy to make your gift truly unique and memorable.
                  </p>
                  <Link to="/contact">
                    <Button variant="outline" className="mt-4">
                      Contact for Customization
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border p-6">
                  <Package className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Delivery Timeline</h3>
                  <ul className="space-y-2 font-body text-muted-foreground">
                    <li>• Standard Delivery: 5-7 business days</li>
                    <li>• Express Delivery: 2-3 business days (extra charges)</li>
                    <li>• Free shipping on orders above ₹999</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border p-6">
                  <Truck className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Shipping Policy</h3>
                  <ul className="space-y-2 font-body text-muted-foreground">
                    <li>• Pan-India delivery available</li>
                    <li>• Secure packaging for fragile items</li>
                    <li>• Real-time tracking provided</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="care" className="mt-6">
              <div className="max-w-2xl">
                <h3 className="mb-4 font-display text-xl font-semibold text-foreground">
                  How to Care for Your Handmade Product
                </h3>
                <ul className="space-y-3 font-body text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    Store in a cool, dry place away from direct sunlight
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    Handle with care to preserve delicate embellishments
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    Keep away from moisture and humidity
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    Clean gently with a soft, dry cloth if needed
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    Avoid placing heavy objects on top
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Reviews Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
              Customer Reviews
            </h2>

            {/* Review Summary */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-center">
                <span className="font-display text-5xl font-bold text-foreground">{averageRating}</span>
                <div className="mt-2 flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-5 w-5",
                        star <= Math.round(Number(averageRating))
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Based on {reviews.length} reviews
                </p>
              </div>
            </div>

            {/* Write Review */}
            {user && canReview && (
              <div className="mb-8 rounded-xl bg-secondary/50 p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                  Write a Review
                </h3>
                <div className="mb-4">
                  <label className="mb-2 block font-body text-sm font-medium text-foreground">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview((r) => ({ ...r, rating: star }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-7 w-7",
                            star <= newReview.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="mb-2 block font-body text-sm font-medium text-foreground">
                    Your Review
                  </label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value }))}
                    placeholder="Share your experience with this product..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            )}

            {!user && (
              <div className="mb-8 rounded-xl bg-secondary/50 p-6 text-center">
                <p className="font-body text-muted-foreground">
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to write a review after purchasing this product.
                </p>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-semibold">
                        {review.user_name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-body font-medium text-foreground">
                          {review.user_name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-muted text-muted"
                                )}
                              />
                            ))}
                          </div>
                          <span className="font-body text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="font-body text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center font-body text-muted-foreground py-8">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <h2 className="mb-8 font-display text-2xl font-bold text-foreground">
              You May Also Like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="group rounded-2xl bg-card overflow-hidden shadow-soft transition-all duration-300 hover:shadow-hover"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop"}
                      alt={relatedProduct.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 font-display text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-foreground">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      {relatedProduct.original_price && (
                        <span className="font-body text-sm text-muted-foreground line-through">
                          {formatPrice(relatedProduct.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}