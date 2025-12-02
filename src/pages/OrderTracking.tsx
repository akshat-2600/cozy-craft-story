import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package, CheckCircle, Circle } from "lucide-react";
import { format } from "date-fns";

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderAndTracking();
    }
  }, [user, orderId]);

  const fetchOrderAndTracking = async () => {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .eq("user_id", user!.id)
      .single();

    if (orderError || !orderData) {
      navigate("/orders");
      return;
    }

    // Check if order is approved
    if (!["approved", "processing", "shipped", "delivered"].includes(orderData.status)) {
      navigate("/orders");
      return;
    }

    setOrder(orderData);

    const { data: trackingData } = await supabase
      .from("order_tracking")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (trackingData) {
      setTracking(trackingData);
    }

    setLoading(false);
  };

  if (!user || loading) {
    return null;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 font-display text-3xl font-bold">Order Tracking</h1>
          <p className="mb-8 font-body text-muted-foreground">
            Order #{order.id.slice(0, 8)}
          </p>

          <div className="mb-8 rounded-xl bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-display text-xl font-bold">Shipment Details</h2>
                <p className="font-body text-sm text-muted-foreground">
                  Delivering to {order.shipping_city}
                </p>
              </div>
            </div>

            {tracking.length > 0 && tracking[0].tracking_number && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-body text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-body font-medium">{tracking[0].tracking_number}</p>
                {tracking[0].carrier && (
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    Carrier: {tracking[0].carrier}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-card p-6 shadow-soft">
            <h2 className="mb-6 font-display text-xl font-bold">Tracking History</h2>

            {tracking.length === 0 ? (
              <p className="font-body text-muted-foreground">
                No tracking updates available yet.
              </p>
            ) : (
              <div className="relative space-y-6">
                {tracking.map((update, index) => (
                  <div key={update.id} className="relative flex gap-4">
                    <div className="relative flex flex-col items-center">
                      {index === 0 ? (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                      {index < tracking.length - 1 && (
                        <div className="mt-2 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-body font-medium">{update.status}</p>
                      {update.description && (
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          {update.description}
                        </p>
                      )}
                      {update.location && (
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          {update.location}
                        </p>
                      )}
                      <p className="mt-2 font-body text-xs text-muted-foreground">
                        {format(new Date(update.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTracking;
