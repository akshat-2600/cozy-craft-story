import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const products = [
  {
    id: 1,
    name: "Love Story Explosion Box",
    price: 2499,
    originalPrice: 2999,
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop",
    category: "Explosion Boxes",
    isNew: true,
    isBestseller: false,
  },
  {
    id: 2,
    name: "Floral Birthday Greeting Card",
    price: 399,
    originalPrice: null,
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=500&h=500&fit=crop",
    category: "Greeting Cards",
    isNew: false,
    isBestseller: true,
  },
  {
    id: 3,
    name: "Wedding Anniversary Album",
    price: 3999,
    originalPrice: 4999,
    rating: 5.0,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500&h=500&fit=crop",
    category: "Anniversary Albums",
    isNew: false,
    isBestseller: true,
  },
  {
    id: 4,
    name: "Pop-up 3D Memory Album",
    price: 2999,
    originalPrice: 3499,
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
    category: "3D Albums",
    isNew: true,
    isBestseller: false,
  },
  {
    id: 5,
    name: "Pyramid Photo Album",
    price: 1899,
    originalPrice: null,
    rating: 4.6,
    reviews: 43,
    image: "https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=500&h=500&fit=crop",
    category: "Pyramid Albums",
    isNew: false,
    isBestseller: false,
  },
  {
    id: 6,
    name: "Birthday Surprise Box",
    price: 1999,
    originalPrice: 2499,
    rating: 4.9,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&h=500&fit=crop",
    category: "Birthday Cards",
    isNew: true,
    isBestseller: true,
  },
  {
    id: 7,
    name: "Compact Memory Mini Album",
    price: 999,
    originalPrice: null,
    rating: 4.5,
    reviews: 72,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop",
    category: "Mini Albums",
    isNew: false,
    isBestseller: false,
  },
  {
    id: 8,
    name: "Thank You Card Set (5 pcs)",
    price: 799,
    originalPrice: 999,
    rating: 4.8,
    reviews: 134,
    image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=500&h=500&fit=crop",
    category: "Greeting Cards",
    isNew: false,
    isBestseller: true,
  },
];

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div
      className="group relative rounded-2xl bg-card overflow-hidden shadow-soft transition-all duration-500 hover:shadow-hover animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square image-zoom">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Bestseller
            </span>
          )}
          {product.originalPrice && (
            <span className="rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-soft transition-all hover:bg-card hover:scale-110"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Button className="w-full" size="sm">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="mb-1 block font-body text-xs text-muted-foreground">
          {product.category}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-2 font-display text-base font-semibold text-foreground transition-colors hover:text-primary line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-body text-sm font-medium text-foreground">{product.rating}</span>
          </div>
          <span className="font-body text-xs text-muted-foreground">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-body text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="mb-4 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary">
              Featured Products
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Handpicked for You
            </h2>
          </div>
          <Link to="/shop">
            <Button variant="outline" size="lg">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
