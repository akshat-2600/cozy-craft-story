import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Heart, Sparkles, Award, Users } from "lucide-react";

const values = [
  { icon: Heart, title: "Crafted with Love", description: "Every piece is made by hand with genuine care and attention to detail." },
  { icon: Sparkles, title: "Unique Designs", description: "No two creations are exactly alike - each one tells its own story." },
  { icon: Award, title: "Premium Quality", description: "We use only the finest materials to ensure lasting memories." },
  { icon: Users, title: "Customer First", description: "Your satisfaction and happiness are at the heart of everything we do." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <span className="mb-4 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary">
              Our Story
            </span>
            <h1 className="mb-6 font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              Turning Spaces into Stories
            </h1>
            <p className="mx-auto max-w-3xl font-body text-lg text-muted-foreground leading-relaxed">
              At Cozy Decors, we believe that every moment deserves to be cherished. Our handcrafted creations transform your precious memories into tangible treasures that last a lifetime.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-card">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop"
                    alt="Crafting handmade products"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 h-48 w-48 overflow-hidden rounded-2xl shadow-card lg:h-64 lg:w-64">
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop"
                    alt="Handmade explosion box"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <span className="mb-4 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary">
                  Who We Are
                </span>
                <h2 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl">
                  From Passion to Purpose
                </h2>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                  <p>
                    What started as a hobby in a small corner of our home has blossomed into Cozy Decors - a brand dedicated to bringing warmth and personality to your most cherished moments.
                  </p>
                  <p>
                    Our founder's love for paper crafts began over a decade ago when she created her first handmade album for a friend's wedding. The joy it brought inspired a journey of creativity that has touched hundreds of hearts since then.
                  </p>
                  <p>
                    Today, our team of skilled artisans continues this tradition, crafting each piece with the same passion and dedication. Whether it's an explosion box that reveals love stories layer by layer, or a 3D album that brings memories to life, every creation is infused with care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-secondary/30 py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary">
                What We Stand For
              </span>
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                Our Values
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-card animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
