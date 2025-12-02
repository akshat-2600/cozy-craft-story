import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package, ChevronRight } from "lucide-react";
import { format } from "date-fns";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-800",
    payment_uploaded: "bg-blue-100 text-blue-800",
    payment_verified: "bg-indigo-100 text-indigo-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <p className="text-center font-body text-muted-foreground">Loading orders...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-bold">No orders yet</h2>
            <p className="mt-2 font-body text-muted-foreground">
              Start shopping to see your orders here!
            </p>
            <Link to="/shop">
              <Button className="mt-6">Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-display text-3xl font-bold">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl bg-card p-6 shadow-soft">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-body text-sm text-muted-foreground">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "PPP")}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {order.order_items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium line-clamp-1">
                        {item.product_name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="font-body text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-display text-lg font-bold">{formatPrice(order.total_amount)}</p>
                </div>
                {["approved", "processing", "shipped", "delivered"].includes(order.status) && (
                  <Link to={`/orders/${order.id}/tracking`}>
                    <Button variant="outline" size="sm">
                      Track Order
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
