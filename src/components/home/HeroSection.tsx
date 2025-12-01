import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-hero">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-primary/5 blur-2xl animate-float" />
      </div>

      <div className="container relative mx-auto px-4 py-20 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-up">
              <Sparkles className="h-4 w-4" />
              <span>Handcrafted with Love</span>
            </div>
            
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Turning Spaces
              <br />
              <span className="text-gradient">into Stories</span>
            </h1>
            
            <p className="mb-8 max-w-lg mx-auto lg:mx-0 font-body text-lg text-muted-foreground leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Discover unique handmade crafts that bring warmth and personality to every corner. From explosion boxes to 3D albums, each piece is crafted to capture your precious moments.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="hero-outline" size="xl">
                  Our Story
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">500+</div>
                <div className="font-body text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">200+</div>
                <div className="font-body text-sm text-muted-foreground">Unique Designs</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">100%</div>
                <div className="font-body text-sm text-muted-foreground">Handmade</div>
              </div>
            </div>
          </div>

          {/* Hero Images */}
          <div className="relative h-[400px] lg:h-[600px] animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute right-0 top-0 h-64 w-64 lg:h-80 lg:w-80 overflow-hidden rounded-3xl shadow-card rotate-3 transition-transform hover:rotate-0 hover:scale-105 duration-500">
              <img
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop"
                alt="Handmade craft explosion box"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute left-0 top-1/4 h-52 w-52 lg:h-64 lg:w-64 overflow-hidden rounded-3xl shadow-card -rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-500">
              <img
                src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop"
                alt="Handmade greeting cards"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-1/4 h-48 w-48 lg:h-56 lg:w-56 overflow-hidden rounded-3xl shadow-card rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-500">
              <img
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop"
                alt="Handmade photo album"
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute bottom-20 left-0 rounded-2xl bg-card/80 backdrop-blur-sm p-4 shadow-card animate-float">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-body text-sm font-semibold text-foreground">Made with Love</div>
                  <div className="font-body text-xs text-muted-foreground">Each piece is unique</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
