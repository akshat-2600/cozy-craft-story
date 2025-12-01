import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    text: "The explosion box I ordered for my husband's birthday was absolutely stunning! The attention to detail was incredible. He was moved to tears. Thank you Cozy Decors!",
    product: "Love Story Explosion Box",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    location: "Delhi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "Ordered a custom anniversary album for my parents' 25th wedding anniversary. The quality exceeded my expectations. It's now their most treasured possession.",
    product: "Anniversary Album",
  },
  {
    id: 3,
    name: "Anjali Gupta",
    location: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    text: "I've ordered multiple times from Cozy Decors. Each piece is unique and beautiful. The 3D album I got was a perfect gift. Highly recommend!",
    product: "3D Memory Album",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block font-body text-sm font-medium uppercase tracking-wider text-primary">
            Customer Love
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mx-auto max-w-2xl font-body text-lg text-muted-foreground">
            Real stories from real customers who have experienced the magic of our handcrafted creations.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 right-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-soft">
                  <Quote className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="mb-6 font-body text-muted-foreground leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Product Tag */}
              <span className="mb-4 inline-block rounded-full bg-secondary px-3 py-1 font-body text-xs font-medium text-secondary-foreground">
                {testimonial.product}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-display text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="font-body text-xs text-muted-foreground">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
