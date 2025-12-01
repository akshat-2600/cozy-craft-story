import { Link } from "react-router-dom";
import { ArrowRight, Gift, Truck, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Gift,
    title: "Gift Wrapping",
    description: "Beautiful packaging included",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help",
  },
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-warm py-20 lg:py-28">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Features */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm p-4 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-primary-foreground">
                  {feature.title}
                </div>
                <div className="font-body text-xs text-primary-foreground/80">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Content */}
        <div className="text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            Ready to Create Something Special?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl font-body text-lg text-primary-foreground/90">
            Every piece at Cozy Decors is crafted with passion and care. Let us help you create memories that last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop">
              <Button
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
              >
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Custom Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
