import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowUpRight } from "lucide-react";

const categories = [
  { id: 1, name: "Explosion Boxes", description: "Surprise gift boxes that unfold to reveal treasured memories layer by layer. Perfect for birthdays, anniversaries, and special occasions.", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop", count: 24, slug: "explosion-boxes" },
  { id: 2, name: "Greeting Cards", description: "Heartfelt handmade cards for every occasion. From birthdays to thank you notes, each card carries a personal touch.", image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=400&fit=crop", count: 56, slug: "greeting-cards" },
  { id: 3, name: "3D Albums", description: "Interactive albums that bring your photos to life with pop-up elements and dimensional designs.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", count: 18, slug: "3d-albums" },
  { id: 4, name: "Anniversary Albums", description: "Celebrate love stories with custom memory books designed to capture years of precious moments.", image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=400&fit=crop", count: 32, slug: "anniversary-albums" },
  { id: 5, name: "Birthday Cards", description: "Make birthdays extra special with unique designs that bring joy and smiles to the recipient.", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop", count: 45, slug: "birthday-cards" },
  { id: 6, name: "Pyramid Albums", description: "Unique pyramid-shaped albums that display photos in a creative, space-saving format.", image: "https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=600&h=400&fit=crop", count: 15, slug: "pyramid-albums" },
  { id: 7, name: "Mini Albums", description: "Compact treasures perfect for capturing small moments. Great for travel memories and daily highlights.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop", count: 28, slug: "mini-albums" },
  { id: 8, name: "General Albums", description: "Classic handmade albums suitable for all occasions. Customize with your preferred themes and colors.", image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=600&h=400&fit=crop", count: 22, slug: "general-albums" },
];

const Categories = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-hero py-16 lg:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <span className="mb-4 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary">
              Browse by Category
            </span>
            <h1 className="mb-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
              Our Collections
            </h1>
            <p className="mx-auto max-w-2xl font-body text-lg text-muted-foreground">
              Discover handcrafted treasures organized by category. Each collection showcases our dedication to quality and creativity.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-500 hover:shadow-hover animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-[4/3] md:aspect-auto image-zoom">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 lg:p-8">
                      <span className="mb-2 inline-block self-start rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                        {category.count} items
                      </span>
                      <h3 className="mb-3 font-display text-xl font-bold text-foreground lg:text-2xl">
                        {category.name}
                      </h3>
                      <p className="mb-4 font-body text-sm text-muted-foreground line-clamp-3">
                        {category.description}
                      </p>
                      <div className="mt-auto flex items-center gap-2 font-body text-sm font-medium text-primary">
                        Explore Collection
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
