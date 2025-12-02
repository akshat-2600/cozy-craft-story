import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

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

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    status: "",
    description: "",
    location: "",
    carrier: "",
    tracking_number: "",
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchOrders();
  }, [user, isAdmin]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), profiles(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const verifyPayment = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "payment_verified",
        payment_verified_by: user!.id,
        payment_verified_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Payment verified successfully" });
    fetchOrders();
  };

  const approveOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "approved" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Create initial tracking entry
    await supabase.from("order_tracking").insert({
      order_id: orderId,
      status: "Order Approved",
      description: "Your order has been approved and will be processed soon.",
      updated_by: user!.id,
    });

    toast({ title: "Order approved successfully" });
    fetchOrders();
  };

  const rejectOrder = async (orderId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "rejected", rejection_reason: reason })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Order rejected" });
    fetchOrders();
  };

  const updateTracking = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("order_tracking").insert({
      order_id: selectedOrder.id,
      ...trackingForm,
      updated_by: user!.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Update order status if needed
    if (trackingForm.status === "Shipped") {
      await supabase
        .from("orders")
        .update({ status: "shipped" })
        .eq("id", selectedOrder.id);
    } else if (trackingForm.status === "Delivered") {
      await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", selectedOrder.id);
    }

    toast({ title: "Tracking updated successfully" });
    setDialogOpen(false);
    setTrackingForm({
      status: "",
      description: "",
      location: "",
      carrier: "",
      tracking_number: "",
    });
    fetchOrders();
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center px-4 py-4">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="ml-4 font-display text-2xl font-bold">Manage Orders</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl bg-card p-6 shadow-soft">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-body text-sm font-medium">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "PPp")}
                  </p>
                  <p className="mt-1 font-body text-sm">
                    Customer: {order.profiles?.full_name || order.profiles?.email}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>

              <div className="mb-4">
                <p className="mb-2 font-body text-sm font-medium">Order Items:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {order.order_items.map((item: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-muted/50 p-3">
                      <p className="font-body text-sm font-medium">{item.product_name}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        Qty: {item.quantity} × ₹{item.product_price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-body text-xs text-muted-foreground">Shipping Address</p>
                  <p className="font-body text-sm">
                    {order.shipping_address}, {order.shipping_city} - {order.shipping_zip}
                  </p>
                  <p className="font-body text-sm">Phone: {order.shipping_phone}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-body text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-display text-lg font-bold">
                    ₹{order.total_amount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {order.payment_screenshot_url && (
                <div className="mb-4">
                  <a
                    href={order.payment_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Payment Screenshot
                  </a>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {order.status === "payment_uploaded" && (
                  <>
                    <Button size="sm" onClick={() => verifyPayment(order.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Payment
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectOrder(order.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {order.status === "payment_verified" && (
                  <Button size="sm" onClick={() => approveOrder(order.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Order
                  </Button>
                )}
                {["approved", "processing", "shipped"].includes(order.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDialogOpen(true);
                    }}
                  >
                    Update Tracking
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tracking</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateTracking} className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={trackingForm.status}
                onValueChange={(value) => setTrackingForm({ ...trackingForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={trackingForm.description}
                onChange={(e) =>
                  setTrackingForm({ ...trackingForm, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={trackingForm.location}
                onChange={(e) => setTrackingForm({ ...trackingForm, location: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  value={trackingForm.carrier}
                  onChange={(e) =>
                    setTrackingForm({ ...trackingForm, carrier: e.target.value })
                  }
                  placeholder="e.g., FedEx, DHL"
                />
              </div>
              <div>
                <Label htmlFor="tracking_number">Tracking Number</Label>
                <Input
                  id="tracking_number"
                  value={trackingForm.tracking_number}
                  onChange={(e) =>
                    setTrackingForm({ ...trackingForm, tracking_number: e.target.value })
                  }
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Update Tracking
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
