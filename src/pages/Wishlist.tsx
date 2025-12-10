import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url,
    });
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image_url: item.image_url,
      });
    });
    clearWishlist();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border bg-gradient-hero py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                My Wishlist
              </h1>
            </div>
            <p className="max-w-2xl font-body text-lg text-muted-foreground">
              {items.length > 0
                ? `You have ${items.length} item${items.length > 1 ? "s" : ""} in your wishlist.`
                : "Your wishlist is empty. Start adding items you love!"}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Heart className="h-24 w-24 text-muted-foreground/30 mb-6" />
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Your wishlist is empty
              </h2>
              <p className="font-body text-muted-foreground mb-8 max-w-md">
                Browse our collection and click the heart icon on products you love to save them here.
              </p>
              <Link to="/shop">
                <Button size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <Link to="/shop">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={clearWishlist}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                  <Button size="sm" onClick={handleMoveAllToCart}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add All to Cart
                  </Button>
                </div>
              </div>

              {/* Wishlist Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl bg-card overflow-hidden shadow-soft transition-all duration-500 hover:shadow-hover animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative aspect-square image-zoom">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      {item.original_price && (
                        <span className="absolute left-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
                          Sale
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-soft transition-all hover:bg-destructive hover:text-destructive-foreground hover:scale-110"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <Button className="w-full" size="sm" onClick={() => handleAddToCart(item)}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="mb-1 block font-body text-xs text-muted-foreground capitalize">
                        {item.category.replace("-", " ")}
                      </span>
                      <Link to={`/product/${item.id}`}>
                        <h3 className="mb-2 font-display text-base font-semibold text-foreground transition-colors hover:text-primary line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      {item.rating && (
                        <div className="mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-body text-sm font-medium text-foreground">{item.rating}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-foreground">
                          {formatPrice(item.price)}
                        </span>
                        {item.original_price && (
                          <span className="font-body text-sm text-muted-foreground line-through">
                            {formatPrice(item.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
