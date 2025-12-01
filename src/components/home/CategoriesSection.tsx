import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Explosion Boxes",
    description: "Surprise gift boxes that unfold to reveal treasured memories",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=600&fit=crop",
    count: 24,
    slug: "explosion-boxes",
  },
  {
    id: 2,
    name: "Greeting Cards",
    description: "Heartfelt handmade cards for every occasion",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=500&h=600&fit=crop",
    count: 56,
    slug: "greeting-cards",
  },
  {
    id: 3,
    name: "3D Albums",
    description: "Interactive albums that bring your photos to life",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=600&fit=crop",
    count: 18,
    slug: "3d-albums",
  },
  {
    id: 4,
    name: "Anniversary Albums",
    description: "Celebrate love stories with custom memory books",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500&h=600&fit=crop",
    count: 32,
    slug: "anniversary-albums",
  },
  {
    id: 5,
    name: "Birthday Cards",
    description: "Make birthdays extra special with unique designs",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&h=600&fit=crop",
    count: 45,
    slug: "birthday-cards",
  },
  {
    id: 6,
    name: "Mini Albums",
    description: "Compact treasures perfect for small moments",
    image: "https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=500&h=600&fit=crop",
    count: 28,
    slug: "mini-albums",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary">
            Browse Categories
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Discover Our Collections
          </h2>
          <p className="mx-auto max-w-2xl font-body text-lg text-muted-foreground">
            Each category showcases unique handcrafted pieces designed to capture and preserve your most cherished moments.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-500 hover:shadow-hover animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[4/5] image-zoom">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    {category.count} items
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mb-1 font-display text-xl font-semibold">
                  {category.name}
                </h3>
                <p className="font-body text-sm text-primary-foreground/80 line-clamp-2">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
